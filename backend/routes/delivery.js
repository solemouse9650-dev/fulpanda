const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST /api/delivery/calcular-costo
// Calcula el costo de envío basado en la distancia
router.post('/calcular-costo', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'La dirección es requerida' });
    }

    // Obtener coordenadas del restaurante
    const restaurantLat = parseFloat(process.env.RESTAURANT_LAT) || -27.3667;
    const restaurantLng = parseFloat(process.env.RESTAURANT_LNG) || -55.9167;

    // Calcular distancia usando Google Maps API
    let distance = 0;
    
    if (process.env.GOOGLE_MAPS_API_KEY) {
      // Usar Google Maps Distance Matrix API
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/distancematrix/json?` +
          `origins=${restaurantLat},${restaurantLng}` +
          `&destinations=${encodeURIComponent(address)}` +
          `&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );

        if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
          // Obtener distancia en metros y convertirla a kilómetros
          distance = response.data.rows[0].elements[0].distance.value / 1000;
        }
      } catch (error) {
        console.error('Error al calcular distancia con Google Maps:', error.message);
      }
    }

    // Si no se pudo obtener distancia con Google Maps, usar una lógica simple
    if (distance === 0) {
      distance = estimateDistance(address);
    }

    // Calcular costo de envío
    const costPerKm = parseFloat(process.env.DELIVERY_COST_PER_KM) || 50;
    const minCost = parseFloat(process.env.MIN_DELIVERY_COST) || 200;
    const freeThreshold = parseFloat(process.env.FREE_DELIVERY_THRESHOLD) || 5000;

    let deliveryCost = Math.max(distance * costPerKm, minCost);

    // Envío gratis si el pedido supera el umbral
    const cartTotal = req.body.cartTotal || 0;
    if (cartTotal >= freeThreshold) {
      deliveryCost = 0;
    }

    res.json({
      success: true,
      distance: Math.round(distance * 100) / 100, // Redondear a 2 decimales
      deliveryCost: Math.round(deliveryCost),
      freeDelivery: cartTotal >= freeThreshold,
      estimatedTime: estimateDeliveryTime(distance)
    });

  } catch (error) {
    console.error('Error al calcular costo de envío:', error);
    res.status(500).json({ error: 'Error al calcular el costo de envío' });
  }
});

// Función para estimar distancia basada en palabras clave de la dirección
function estimateDistance(address) {
  const addressLower = address.toLowerCase();
  
  // Lógica simple basada en palabras clave
  if (addressLower.includes('centro') || addressLower.includes('casa de gobierno')) {
    return 1; // 1 km
  } else if (addressLower.includes('barrio') || addressLower.includes('villa')) {
    return 3; // 3 km
  } else if (addressLower.includes('km') || addressLower.includes('kilómetro')) {
    const match = addressLower.match(/(\d+)\s*km/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  // Distancia por defecto
  return 2; // 2 km
}

// Función para estimar tiempo de entrega
function estimateDeliveryTime(distance) {
  const baseTime = 20; // 20 minutos base
  const timePerKm = 5; // 5 minutos por km
  
  return baseTime + (distance * timePerKm);
}

module.exports = router;
