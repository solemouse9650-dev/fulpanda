const mercadopago = require('mercadopago');

// Configurar Mercado Pago con credenciales reales
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('ERROR: No se encontró MERCADO_PAGO_ACCESS_TOKEN en las variables de entorno');
  console.error('Por favor, configura las credenciales de Mercado Pago en el archivo .env');
  process.exit(1);
}

// Configurar SDK de Mercado Pago - versión 2.0 (método correcto)
const client = new mercadopago.MercadoPagoConfig({ 
  accessToken: accessToken 
});

console.log('✅ Mercado Pago configurado correctamente');
console.log('🔑 Access Token:', accessToken.substring(0, 10) + '...');

module.exports = client;
