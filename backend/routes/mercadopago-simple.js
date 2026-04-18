const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// POST /api/mercadopago/crear-pago
// Versión ultra simplificada para aislar el error
router.post('/crear-pago', async (req, res) => {
  try {
    console.log('Simple: Recibida solicitud');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { cart, customerData, orderType, deliveryCost = 0, paymentMethod } = req.body;

    // Validación básica
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    if (!customerData || !customerData.name || !customerData.phone) {
      return res.status(400).json({ error: 'Faltan datos del cliente' });
    }

    // Calcular total
    const productsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = productsTotal + deliveryCost;

    // Generar ID simple
    const orderId = 'order-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    console.log('Simple: orderId generado:', orderId);

    // Responder inmediatamente sin guardar en base de datos
    if (paymentMethod === 'efectivo') {
      console.log('Simple: Pedido en efectivo procesado');
      return res.json({
        success: true,
        orderId,
        message: 'Pedido registrado. Pago en efectivo al retirar/recibir.',
        paymentUrl: null
      });
    }

    // Simular pago con Mercado Pago
    console.log('Simple: Simulando pago con Mercado Pago');
    const mockPaymentUrl = `http://localhost:8000/pago-simulado?order=${orderId}&total=${total}`;
    
    res.json({
      success: true,
      orderId,
      paymentUrl: mockPaymentUrl,
      preferenceId: 'mock-preference-' + orderId,
      message: 'Pago simulado - en producción esto redirigiría a Mercado Pago'
    });

  } catch (error) {
    console.error('Simple: Error:', error.message);
    console.error('Simple: Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al crear el pago',
      message: error.message 
    });
  }
});

module.exports = router;
