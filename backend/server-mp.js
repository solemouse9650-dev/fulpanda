const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar rutas
const mercadopagoRoutes = require('./routes/mercadopago-checkout');
const webhookRoutes = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://sdk.mercadopago.com"],
      scriptSrc: ["'self'", "https://sdk.mercadopago.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.mercadopago.com"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
  message: {
    error: 'Demasiadas peticiones desde esta IP',
    message: 'Por favor, intenta nuevamente más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (para las páginas de pago)
app.use(express.static(path.join(__dirname, '../')));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  next();
});

// Rutas de la API
app.use('/api/mercadopago', mercadopagoRoutes);
app.use('/webhook', webhookRoutes);

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Endpoint para registrar pagos fallidos
app.post('/log-failed-payment', async (req, res) => {
  try {
    const failedPayment = req.body;
    console.log('❌ Pago fallido registrado:', failedPayment);
    
    // Aquí podrías guardar en una base de datos
    // await saveFailedPayment(failedPayment);
    
    res.json({
      success: true,
      message: 'Pago fallido registrado correctamente'
    });
  } catch (error) {
    console.error('Error al registrar pago fallido:', error);
    res.status(500).json({
      success: false,
      error: 'Error al registrar pago fallido'
    });
  }
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `No se encontró el endpoint: ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error global:', error);
  
  // Si el error tiene status, usarlo
  const statusCode = error.status || 500;
  
  // No exponer detalles del error en producción
  const message = process.env.NODE_ENV === 'production' 
    ? 'Error interno del servidor'
    : error.message || 'Error desconocido';
  
  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log('🚀 Servidor de Mercado Pago iniciado');
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8000'}`);
  console.log(`🔗 Backend URL: ${process.env.BACKEND_URL || 'http://localhost:3002'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 Endpoints disponibles:');
  console.log('   POST /api/mercadopago/create_preference - Crear preferencia de pago');
  console.log('   GET  /api/mercadopago/get_preference/:id - Obtener preferencia');
  console.log('   POST /api/mercadopago/search_preferences - Buscar preferencias');
  console.log('   POST /webhook - Recibir notificaciones de Mercado Pago');
  console.log('   GET  /webhook/payments - Ver todos los pagos');
  console.log('   GET  /webhook/payments/:id - Ver pago específico');
  console.log('   GET  /health - Health check del servidor');
  console.log('');
  console.log('🌐 Páginas de pago:');
  console.log('   http://localhost:8000/checkout.html - Checkout');
  console.log('   http://localhost:8000/payment-success.html - Pago exitoso');
  console.log('   http://localhost:8000/payment-failure.html - Pago fallido');
  console.log('   http://localhost:8000/payment-pending.html - Pago pendiente');
  console.log('');
});

// Manejo de errores críticos
process.on('uncaughtException', (error) => {
  console.error('💥 Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Rechazo no manejado en:', promise, 'razón:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = app;
