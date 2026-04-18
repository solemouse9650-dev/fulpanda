const http = require('http');

// Datos de prueba para la preferencia
const testData = {
  title: "Empanadas de Carne (6 unidades)",
  price: 2600,
  quantity: 1,
  description: "Deliciosas empanadas de carne criolla, hechas al horno tradicional con masa casera.",
  customer_name: "Juan Pérez",
  customer_email: "juan@ejemplo.com",
  customer_phone: "3764123456",
  currency_id: "ARS",
  category_id: "food"
};

const data = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/mercadopago/create_preference',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('🧪 Probando flujo completo de Mercado Pago...');
console.log('📦 Datos de prueba:', JSON.stringify(testData, null, 2));

const req = http.request(options, (res) => {
  console.log('📊 Status:', res.statusCode);
  console.log('📋 Headers:', res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Response:', body);
    
    try {
      const response = JSON.parse(body);
      
      if (response.success) {
        console.log('✅ ¡PRUEBA EXITOSA!');
        console.log('🆔 Preference ID:', response.preference_id);
        console.log('🔗 Init Point:', response.init_point);
        console.log('📝 External Reference:', response.external_reference);
        console.log('');
        console.log('🎯 Ahora puedes:');
        console.log('1. Abrir http://localhost:8000/checkout.html');
        console.log('2. Completar el formulario');
        console.log('3. Hacer clic en "Comprar con Mercado Pago"');
        console.log('4. Serás redirigido a Mercado Pago');
        console.log('5. Probar el flujo completo');
      } else {
        console.log('❌ Error en la respuesta:', response.error);
      }
    } catch (e) {
      console.log('❌ Error parseando JSON:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error en la petición:', e.message);
});

req.write(data);
req.end();
