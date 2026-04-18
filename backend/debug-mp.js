const mercadopago = require('mercadopago');

console.log('🔍 Debug: Versión de Mercado Pago SDK:', mercadopago.version || 'desconocida');
console.log('🔍 Debug: Métodos disponibles:', Object.getOwnPropertyNames(mercadopago));

// Intentar configurar con diferentes métodos
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-2155688738177033-041218-6e4386a9c8998a571b5f6e1a289f5f5-3330256767';

console.log('🔍 Debug: Access Token:', accessToken.substring(0, 10) + '...');

// Método 1: configure
try {
  console.log('🔍 Debug: Intentando método configure...');
  mercadopago.configure({
    access_token: accessToken
  });
  console.log('✅ Debug: Método configure funcionó');
} catch (error) {
  console.log('❌ Debug: Método configure falló:', error.message);
}

// Método 2: configurations.setAccessToken
try {
  console.log('🔍 Debug: Intentando método configurations.setAccessToken...');
  mercadopago.configurations.setAccessToken(accessToken);
  console.log('✅ Debug: Método configurations.setAccessToken funcionó');
} catch (error) {
  console.log('❌ Debug: Método configurations.setAccessToken falló:', error.message);
}

// Método 3: new MercadoPagoConfig
try {
  console.log('🔍 Debug: Intentando método new MercadoPagoConfig...');
  const client = new mercadopago.MercadoPagoConfig({ 
    accessToken: accessToken 
  });
  console.log('✅ Debug: Método new MercadoPagoConfig funcionó');
  module.exports = client;
} catch (error) {
  console.log('❌ Debug: Método new MercadoPagoConfig falló:', error.message);
}

// Método 4: Solo exportar el SDK sin configurar
try {
  console.log('🔍 Debug: Exportando SDK sin configurar...');
  module.exports = mercadopago;
  console.log('✅ Debug: Exportación sin configurar funcionó');
} catch (error) {
  console.log('❌ Debug: Exportación sin configurar falló:', error.message);
}
