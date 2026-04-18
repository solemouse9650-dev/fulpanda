const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET /api/orders
// Obtiene todos los pedidos (para panel de administración)
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;
    
    let orders;
    if (status) {
      orders = await Order.getByStatus(status);
    } else {
      orders = await Order.getAll(parseInt(limit), parseInt(offset));
    }
    
    res.json({
      success: true,
      orders,
      total: orders.length
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
});

// GET /api/orders/:orderId
// Obtiene un pedido específico
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
});

// PUT /api/orders/:orderId/status
// Actualiza el estado de un pedido
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'El estado es requerido' });
    }

    const validStatuses = ['pendiente_pago_mp', 'pendiente_pago_efectivo', 'pagado', 'preparando', 'listo', 'entregado', 'cancelado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const result = await Order.updateStatus(orderId, status);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({
      success: true,
      message: 'Estado actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
});

module.exports = router;
