const http = require('http');

const data = JSON.stringify({
  cart: [
    {
      name: "Test",
      price: 100,
      quantity: 1
    }
  ],
  customerData: {
    name: "Test User",
    phone: "123456789"
  },
  orderType: "retiro",
  paymentMethod: "efectivo"
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/mercadopago/crear-pago',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Enviando petición de prueba...');
console.log('Data:', data);

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', body);
    try {
      const response = JSON.parse(body);
      console.log('Parsed Response:', response);
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Error en petición:', e.message);
});

req.write(data);
req.end();
