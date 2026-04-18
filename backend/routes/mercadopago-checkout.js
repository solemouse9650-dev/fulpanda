const express = require('express');
const router = express.Router();
const mercadopago = require('../config/mercadopago');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');

// Schema de validación para crear preferencia
const createPreferenceSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  price: Joi.number().required().min(0.01),
  quantity: Joi.number().required().min(1).max(1000),
  description: Joi.string().optional().max(500),
  currency_id: Joi.string().optional().default('ARS'),
  picture_url: Joi.string().uri().optional(),
  category_id: Joi.string().optional(),
  external_reference: Joi.string().optional(),
  customer_email: Joi.string().email().optional(),
  customer_name: Joi.string().optional().max(100),
  customer_phone: Joi.string().optional().max(20)
});

// POST /create_preference
// Crea una preferencia de pago en Mercado Pago Checkout Pro
router.post('/create_preference', async (req, res) => {
  try {
    console.log('🔄 Creando preferencia de pago...');
    console.log('📦 Datos recibidos:', JSON.stringify(req.body, null, 2));

    // Validar datos de entrada
    const { error, value } = createPreferenceSchema.validate(req.body);
    if (error) {
      console.error('❌ Error de validación:', error.details[0].message);
      return res.status(400).json({
        error: 'Datos inválidos',
        message: error.details[0].message,
        details: error.details
      });
    }

    const {
      title,
      price,
      quantity,
      description,
      currency_id = 'ARS',
      picture_url,
      category_id,
      external_reference,
      customer_email,
      customer_name,
      customer_phone
    } = value;

    // Generar external_reference único si no se proporciona
    const paymentReference = external_reference || `order_${Date.now()}_${uuidv4().substring(0, 8)}`;

    // Construir el item para Mercado Pago
    const item = {
      id: uuidv4(),
      title: title,
      description: description || title,
      quantity: quantity,
      unit_price: parseFloat(price),
      currency_id: currency_id,
      picture_url: picture_url,
      category_id: category_id
    };

    // Construir la preferencia completa
    const preference = {
      items: [item],
      external_reference: paymentReference,
      payer: {
        name: customer_name,
        email: customer_email,
        phone: {
          number: customer_phone
        }
      },
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/payment/success`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/payment/failure`,
        pending: `${process.env.FRONTEND_URL || 'http://localhost:8000'}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:3002'}/webhook`,
      statement_descriptor: 'FOOD PANDA',
      expires: false,
      expiration_date_from: null,
      expiration_date_to: null
    };

    console.log('📋 Preferencia a crear:', JSON.stringify(preference, null, 2));

    // Crear la preferencia en Mercado Pago
    const response = await mercadopago.preferences.create(preference);
    
    console.log('✅ Preferencia creada exitosamente');
    console.log('🆔 ID de preferencia:', response.id);
    console.log('🔗 URL de pago:', response.init_point);

    // Responder con los datos necesarios
    res.json({
      success: true,
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      external_reference: paymentReference,
      items: response.items,
      payer: response.payer,
      back_urls: response.back_urls,
      notification_url: response.notification_url,
      expires: response.expires,
      date_created: response.date_created
    });

  } catch (error) {
    console.error('❌ Error al crear preferencia:', error);
    console.error('📄 Stack trace:', error.stack);

    // Manejar diferentes tipos de errores de Mercado Pago
    let errorMessage = 'Error al crear la preferencia de pago';
    let statusCode = 500;

    if (error.status) {
      statusCode = error.status;
      errorMessage = error.message || 'Error en la API de Mercado Pago';
    }

    if (error.cause && Array.isArray(error.cause)) {
      errorMessage = error.cause.map(cause => cause.description || cause.message).join(', ');
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.cause || null,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /get_preference/:id
// Obtiene una preferencia existente por su ID
router.get('/get_preference/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'ID de preferencia es requerido'
      });
    }

    console.log(`🔍 Buscando preferencia: ${id}`);
    
    const response = await mercadopago.preferences.get(id);
    
    res.json({
      success: true,
      preference: response.body
    });

  } catch (error) {
    console.error('❌ Error al obtener preferencia:', error);
    res.status(500).json({
      error: 'Error al obtener la preferencia',
      details: error.message
    });
  }
});

// POST /search_preferences
// Busca preferencias con filtros
router.post('/search_preferences', async (req, res) => {
  try {
    const { limit = 10, offset = 0, access_token } = req.body;
    
    const searchParams = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      access_token: access_token || process.env.MERCADO_PAGO_ACCESS_TOKEN
    };

    const response = await mercadopago.preferences.search(searchParams);
    
    res.json({
      success: true,
      preferences: response.body.results,
      paging: response.body.paging,
      total: response.body.paging.total
    });

  } catch (error) {
    console.error('❌ Error al buscar preferencias:', error);
    res.status(500).json({
      error: 'Error al buscar preferencias',
      details: error.message
    });
  }
});

module.exports = router;
