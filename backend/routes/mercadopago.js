const express = require('express');
const router = express.Router();
const mercadopago = require('../config/mercadopago');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const emailService = require('../services/emailService');

// POST /api/mercadopago/crear-pago
// Crea una preferencia de pago en Mercado Pago
router.post('/crear-pago', async (req, res) => {
  try {
    const { 
      cart, 
      customerData, 
      orderType, 
      deliveryCost = 0,
      paymentMethod 
    } = req.body;

    // Validar datos
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    if (!customerData || !customerData.name || !customerData.phone) {
      return res.status(400).json({ error: 'Faltan datos del cliente' });
    }

    if (!orderType || !['delivery', 'retiro'].includes(orderType)) {
      return res.status(400).json({ error: 'Tipo de pedido inválido' });
    }

    // Calcular total
    const productsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = productsTotal + deliveryCost;

    // Crear pedido en la base de datos
    const orderId = uuidv4();
    const order = new Order({
      id: orderId,
      customerData,
      cart,
      orderType,
      deliveryCost,
      productsTotal,
      total,
      paymentMethod,
      status: paymentMethod === 'efectivo' ? 'pendiente_pago_efectivo' : 'pendiente_pago_mp'
    });

    await order.save();

    // Si el pago es en efectivo, notificar al restaurante y devolver respuesta
    if (paymentMethod === 'efectivo') {
      await emailService.sendOrderNotification(order);
      return res.json({
        success: true,
        orderId,
        message: 'Pedido registrado. Pago en efectivo al retirar/recibir.',
        paymentUrl: null
      });
    }

    // Crear preferencia de pago para Mercado Pago
    const items = cart.map(item => ({
      id: item.name,
      title: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      currency_id: 'ARS'
    }));

    // Agregar costo de envío como item si aplica
    if (deliveryCost > 0) {
      items.push({
        id: 'envio',
        title: 'Costo de envío',
        quantity: 1,
        unit_price: deliveryCost,
        currency_id: 'ARS'
      });
    }

    const preference = {
      items: items,
      external_reference: orderId, // ID del pedido para webhook
      payer: {
        name: customerData.name,
        phone: {
          number: customerData.phone
        },
        address: orderType === 'delivery' ? {
          street_name: customerData.address,
          zip_code: customerData.postalCode
        } : undefined
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pedido-exito`,
        failure: `${process.env.FRONTEND_URL}/pedido-error`,
        pending: `${process.env.FRONTEND_URL}/pedido-pendiente`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/mercadopago/webhook`
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({
      success: true,
      orderId,
      paymentUrl: response.body.init_point,
      preferenceId: response.body.id
    });

  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ 
      error: 'Error al crear el pago',
      message: error.message 
    });
  }
});

// POST /api/mercadopago/webhook
// Recibe notificaciones de Mercado Pago
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Obtener información del pago
      const payment = await mercadopago.payment.get(paymentId);
      
      if (payment.body.status === 'approved') {
        const orderId = payment.body.external_reference;
        
        // Actualizar estado del pedido
        const order = await Order.findById(orderId);
        if (order) {
          order.status = 'pagado';
          order.paymentId = paymentId;
          order.paymentStatus = payment.body.status;
          order.paidAt = new Date();
          await order.save();

          // Enviar notificación al restaurante
          await emailService.sendOrderNotification(order);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).send('Error');
  }
});

// GET /api/mercadopago/verificar-pago/:orderId
// Verifica el estado de un pago
router.get('/verificar-pago/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total
    });
  } catch (error) {
    console.error('Error al verificar pago:', error);
    res.status(500).json({ error: 'Error al verificar el pago' });
  }
});

module.exports = router;
