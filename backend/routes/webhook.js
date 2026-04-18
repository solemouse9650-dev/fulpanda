const express = require('express');
const router = express.Router();
const mercadopago = require('../config/mercadopago');
const fs = require('fs').promises;
const path = require('path');

// Archivo para guardar los pagos (simulación de base de datos)
const PAYMENTS_FILE = path.join(__dirname, '../data/payments.json');

// POST /webhook
// Recibe notificaciones de Mercado Pago
router.post('/webhook', async (req, res) => {
  try {
    console.log('🔔 Webhook recibido:', JSON.stringify(req.body, null, 2));
    
    const { type, data } = req.body;

    // Validar que sea una notificación de pago
    if (!type || !data) {
      console.error('❌ Webhook inválido: falta type o data');
      return res.status(400).json({
        error: 'Webhook inválido',
        message: 'Se requieren type y data'
      });
    }

    // Manejar diferentes tipos de notificaciones
    switch (type) {
      case 'payment':
        await handlePaymentNotification(data.id);
        break;
      case 'preapproval':
        await handlePreapprovalNotification(data.id);
        break;
      case 'merchant_order':
        await handleMerchantOrderNotification(data.id);
        break;
      default:
        console.log(`ℹ️ Tipo de notificación no manejado: ${type}`);
    }

    // Responder inmediatamente a Mercado Pago
    res.status(200).send('OK');

  } catch (error) {
    console.error('❌ Error en webhook:', error);
    console.error('📄 Stack trace:', error.stack);
    
    // Aún así responder 200 para que Mercado Pago no reintente
    res.status(200).json({
      error: 'Error procesando webhook',
      message: error.message
    });
  }
});

// Función para manejar notificaciones de pago
async function handlePaymentNotification(paymentId) {
  try {
    console.log(`💳 Procesando notificación de pago: ${paymentId}`);
    
    // Obtener información completa del pago desde Mercado Pago
    const payment = await mercadopago.payment.findById(paymentId);
    const paymentData = payment.body;
    
    console.log('💰 Datos del pago:', JSON.stringify(paymentData, null, 2));

    // Extraer información importante
    const paymentInfo = {
      id: paymentData.id,
      external_reference: paymentData.external_reference,
      status: paymentData.status,
      status_detail: paymentData.status_detail,
      payment_method_id: paymentData.payment_method_id,
      payment_type_id: paymentData.payment_type_id,
      transaction_amount: paymentData.transaction_amount,
      currency_id: paymentData.currency_id,
      installments: paymentData.installments,
      issuer_id: paymentData.issuer_id,
      description: paymentData.description,
      date_created: paymentData.date_created,
      date_approved: paymentData.date_approved,
      date_last_updated: paymentData.date_last_updated,
      money_release_date: paymentData.money_release_date,
      payer: {
        id: paymentData.payer?.id,
        email: paymentData.payer?.email,
        identification: paymentData.payer?.identification,
        first_name: paymentData.payer?.first_name,
        last_name: paymentData.payer?.last_name,
        phone: paymentData.payer?.phone
      },
      metadata: paymentData.metadata,
      fee_details: paymentData.fee_details,
      order_id: paymentData.order?.id
    };

    // Guardar el pago en nuestro sistema
    await savePayment(paymentInfo);

    // Procesar según el estado del pago
    switch (paymentData.status) {
      case 'approved':
        console.log(`✅ Pago aprobado: ${paymentId}`);
        await processApprovedPayment(paymentInfo);
        break;
      case 'pending':
        console.log(`⏳ Pago pendiente: ${paymentId}`);
        await processPendingPayment(paymentInfo);
        break;
      case 'authorized':
        console.log(`🔐 Pago autorizado: ${paymentId}`);
        await processAuthorizedPayment(paymentInfo);
        break;
      case 'in_process':
        console.log(`⚙️ Pago en proceso: ${paymentId}`);
        await processInProcessPayment(paymentInfo);
        break;
      case 'rejected':
        console.log(`❌ Pago rechazado: ${paymentId}`);
        await processRejectedPayment(paymentInfo);
        break;
      case 'cancelled':
        console.log(`🚫 Pago cancelado: ${paymentId}`);
        await processCancelledPayment(paymentInfo);
        break;
      case 'refunded':
        console.log(`💸 Pago reembolsado: ${paymentId}`);
        await processRefundedPayment(paymentInfo);
        break;
      case 'charged_back':
        console.log(`🔄 Contracargo: ${paymentId}`);
        await processChargedBackPayment(paymentInfo);
        break;
      default:
        console.log(`❓ Estado de pago desconocido: ${paymentData.status}`);
    }

  } catch (error) {
    console.error(`❌ Error procesando pago ${paymentId}:`, error);
    throw error;
  }
}

// Función para manejar notificaciones de preaprobación
async function handlePreapprovalNotification(preapprovalId) {
  try {
    console.log(`🔄 Procesando preaprobación: ${preapprovalId}`);
    
    const preapproval = await mercadopago.preapproval.findById(preapprovalId);
    const preapprovalData = preapproval.body;
    
    console.log('📋 Datos de preaprobación:', JSON.stringify(preapprovalData, null, 2));
    
    // Guardar preaprobación
    await savePreapproval(preapprovalData);
    
  } catch (error) {
    console.error(`❌ Error procesando preaprobación ${preapprovalId}:`, error);
    throw error;
  }
}

// Función para manejar notificaciones de orden de comerciante
async function handleMerchantOrderNotification(orderId) {
  try {
    console.log(`📦 Procesando orden de comerciante: ${orderId}`);
    
    const order = await mercadopago.merchantOrder.findById(orderId);
    const orderData = order.body;
    
    console.log('📦 Datos de orden:', JSON.stringify(orderData, null, 2));
    
    // Guardar orden
    await saveMerchantOrder(orderData);
    
  } catch (error) {
    console.error(`❌ Error procesando orden ${orderId}:`, error);
    throw error;
  }
}

// Funciones para procesar diferentes estados de pago
async function processApprovedPayment(paymentInfo) {
  console.log(`🎉 PAGO APROBADO - ID: ${paymentInfo.id}`);
  console.log(`💰 Monto: ${paymentInfo.transaction_amount} ${paymentInfo.currency_id}`);
  console.log(`👤 Cliente: ${paymentInfo.payer?.email}`);
  console.log(`📝 Referencia: ${paymentInfo.external_reference}`);
  
  // Aquí puedes:
  // - Actualizar el estado del pedido en tu base de datos
  // - Enviar email de confirmación al cliente
  // - Enviar notificación al restaurante
  // - Generar factura
  // - Actualizar inventario
}

async function processPendingPayment(paymentInfo) {
  console.log(`⏳ PAGO PENDIENTE - ID: ${paymentInfo.id}`);
  console.log(`📝 Detalle: ${paymentInfo.status_detail}`);
  
  // Aquí puedes:
  // - Mostrar mensaje de "pago en proceso" al cliente
  // - Enviar email de "estamos procesando tu pago"
}

async function processAuthorizedPayment(paymentInfo) {
  console.log(`🔐 PAGO AUTORIZADO - ID: ${paymentInfo.id}`);
  
  // Pago autorizado pero aún no debitado
}

async function processInProcessPayment(paymentInfo) {
  console.log(`⚙️ PAGO EN PROCESO - ID: ${paymentInfo.id}`);
  
  // Pago siendo revisado por el procesador
}

async function processRejectedPayment(paymentInfo) {
  console.log(`❌ PAGO RECHAZADO - ID: ${paymentInfo.id}`);
  console.log(`📝 Motivo: ${paymentInfo.status_detail}`);
  
  // Aquí puedes:
  // - Notificar al cliente del rechazo
  // - Ofrecer métodos de pago alternativos
  // - Guardar el motivo del rechazo para análisis
}

async function processCancelledPayment(paymentInfo) {
  console.log(`🚫 PAGO CANCELADO - ID: ${paymentInfo.id}`);
  
  // El cliente canceló el pago
}

async function processRefundedPayment(paymentInfo) {
  console.log(`💸 PAGO REEMBOLSADO - ID: ${paymentInfo.id}`);
  
  // Procesar reembolso
}

async function processChargedBackPayment(paymentInfo) {
  console.log(`🔄 CONTRACARGO - ID: ${paymentInfo.id}`);
  
  // Procesar contracargo
}

// Funciones para guardar datos (simulación de base de datos)
async function savePayment(paymentInfo) {
  try {
    // Asegurar que el directorio data existe
    const dataDir = path.dirname(PAYMENTS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Leer pagos existentes
    let payments = [];
    try {
      const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
      payments = JSON.parse(data);
    } catch (error) {
      // Si el archivo no existe, empezar con array vacío
      payments = [];
    }
    
    // Buscar si el pago ya existe
    const existingIndex = payments.findIndex(p => p.id === paymentInfo.id);
    
    if (existingIndex >= 0) {
      // Actualizar pago existente
      payments[existingIndex] = {
        ...payments[existingIndex],
        ...paymentInfo,
        updated_at: new Date().toISOString()
      };
    } else {
      // Agregar nuevo pago
      payments.push({
        ...paymentInfo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Guardar en archivo
    await fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
    
    console.log(`💾 Pago guardado: ${paymentInfo.id}`);
    
  } catch (error) {
    console.error('❌ Error guardando pago:', error);
    throw error;
  }
}

async function savePreapproval(preapprovalData) {
  // Similar a savePayment pero para preaprobaciones
  console.log('💾 Preaprobación guardada:', preapprovalData.id);
}

async function saveMerchantOrder(orderData) {
  // Similar a savePayment pero para órdenes
  console.log('💾 Orden guardada:', orderData.id);
}

// GET /webhook/payments
// Endpoint para ver todos los pagos guardados (solo para desarrollo)
router.get('/payments', async (req, res) => {
  try {
    const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
    const payments = JSON.parse(data);
    
    res.json({
      success: true,
      payments,
      total: payments.length
    });
    
  } catch (error) {
    res.json({
      success: true,
      payments: [],
      total: 0
    });
  }
});

// GET /webhook/payments/:id
// Endpoint para ver un pago específico
router.get('/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
    const payments = JSON.parse(data);
    
    const payment = payments.find(p => p.id === id);
    
    if (!payment) {
      return res.status(404).json({
        error: 'Pago no encontrado',
        id
      });
    }
    
    res.json({
      success: true,
      payment
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener pago',
      message: error.message
    });
  }
});

module.exports = router;
