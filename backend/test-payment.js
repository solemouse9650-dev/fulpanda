const mercadopago = require('./config/mercadopago');

async function testMercadoPago() {
    try {
        console.log('Probando conexión con Mercado Pago...');
        
        // Crear una preferencia de prueba
        const preference = {
            items: [
                {
                    id: 'test-item',
                    title: 'Producto de Prueba',
                    quantity: 1,
                    unit_price: 100,
                    currency_id: 'ARS'
                }
            ],
            external_reference: 'test-order-' + Date.now(),
            back_urls: {
                success: 'http://localhost:8000/success',
                failure: 'http://localhost:8000/failure',
                pending: 'http://localhost:8000/pending'
            },
            auto_return: 'approved'
        };

        console.log('Creando preferencia...');
        const response = await mercadopago.preferences.create(preference);
        
        console.log('¡Éxito! Preferencia creada:');
        console.log('ID:', response.body.id);
        console.log('URL:', response.body.init_point);
        console.log('Sandbox URL:', response.body.sandbox_init_point);
        
        return response.body;
        
    } catch (error) {
        console.error('Error al probar Mercado Pago:');
        console.error('Mensaje:', error.message);
        console.error('Código:', error.status);
        console.error('Detalles:', error.cause);
        
        return null;
    }
}

// Ejecutar prueba
testMercadoPago().then(result => {
    if (result) {
        console.log('\n¡Mercado Pago funciona correctamente!');
        console.log('Puedes usar esta URL para probar:', result.sandbox_init_point);
    } else {
        console.log('\nHay un problema con las credenciales de Mercado Pago');
    }
    process.exit(0);
});
