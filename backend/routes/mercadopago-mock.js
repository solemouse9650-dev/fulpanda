const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const emailService = require('../services/emailService');

// POST /api/mercadopago/crear-pago
// Versión mock que simula Mercado Pago sin credenciales
router.post('/crear-pago', async (req, res) => {
  try {
    const { 
      cart, 
      customerData, 
      orderType, 
      deliveryCost = 0,
      paymentMethod 
    } = req.body;

    console.log('Mock: Recibida solicitud de pago');
    console.log('Cart:', cart);
    console.log('Customer:', customerData);
    console.log('Order Type:', orderType);
    console.log('Payment Method:', paymentMethod);

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
    console.log('Mock: Generando orderId:', orderId);
    
    const orderData = {
      id: orderId,
      customerData,
      cart,
      orderType,
      deliveryCost,
      productsTotal,
      total,
      paymentMethod,
      status: paymentMethod === 'efectivo' ? 'pendiente_pago_efectivo' : 'pendiente_pago_mp'
    };
    
    console.log('Mock: Datos del pedido:', JSON.stringify(orderData, null, 2));
    
    const order = new Order();
    await order.save(orderData);
    console.log('Mock: Pedido guardado en base de datos');

    // Si el pago es en efectivo, notificar al restaurante
    if (paymentMethod === 'efectivo') {
      console.log('Mock: Enviando email de pedido en efectivo (desactivado temporalmente)');
      // await emailService.sendOrderNotification(order); // Desactivado temporalmente
      return res.json({
        success: true,
        orderId,
        message: 'Pedido registrado. Pago en efectivo al retirar/recibir.',
        paymentUrl: null
      });
    }

    // Simular pago con Mercado Pago
    console.log('Mock: Simulando pago con Mercado Pago');
    
    // Crear URL de pago simulada
    const mockPaymentUrl = `http://localhost:8000/pago-simulado?order=${orderId}&total=${total}`;
    
    res.json({
      success: true,
      orderId,
      paymentUrl: mockPaymentUrl,
      preferenceId: 'mock-preference-' + orderId,
      message: 'Pago simulado - en producción esto redirigiría a Mercado Pago'
    });

  } catch (error) {
    console.error('Mock: Error al crear pago:', error);
    res.status(500).json({ 
      error: 'Error al crear el pago',
      message: error.message 
    });
  }
});

// POST /api/mercadopago/webhook
// Versión mock que simula webhook
router.post('/webhook', async (req, res) => {
  try {
    console.log('Mock: Webhook recibido');
    
    // Simular pago aprobado después de 3 segundos
    setTimeout(async () => {
      console.log('Mock: Simulando pago aprobado');
      // Aquí podrías actualizar el pedido a "pagado"
      // await emailService.sendPaymentConfirmation(order);
    }, 3000);

    res.status(200).send('OK');
  } catch (error) {
    console.error('Mock: Error en webhook:', error);
    res.status(500).send('Error');
  }
});

// GET /api/mercadopago/verificar-pago/:orderId
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
    console.error('Mock: Error al verificar pago:', error);
    res.status(500).json({ error: 'Error al verificar el pago' });
  }
});

module.exports = router;
