# Backend Food Panda - Sistema de Pedidos y Pagos

## Resumen del Sistema

Este backend profesional reemplaza completamente el flujo de WhatsApp por un sistema automatizado de pedidos con:

- **Mercado Pago** para pagos online
- **Cálculo automático** de costo de envío
- **Notificaciones por email** al restaurante
- **Base de datos** para gestionar pedidos
- **Webhooks** para confirmaciones de pago

## Estructura del Proyecto

```
backend/
|-- package.json              # Dependencias del proyecto
|-- server.js                 # Servidor principal Express
|-- .env.example              # Variables de entorno (copiar a .env)
|-- config/
|   |-- mercadopago.js        # Configuración de Mercado Pago
|-- models/
|   |-- Order.js              # Modelo de pedidos con SQLite
|-- routes/
|   |-- mercadopago.js        # Rutas de Mercado Pago
|   |-- orders.js             # Gestión de pedidos
|   |-- delivery.js           # Cálculo de envío
|-- services/
|   |-- emailService.js       # Sistema de notificaciones
|-- database.sqlite           # Base de datos (se crea automáticamente)
```

## Instalación Paso a Paso

### 1. Instalar Node.js
```bash
# Descargar e instalar Node.js desde https://nodejs.org/
# Versión recomendada: 18.x o superior
node --version  # Verificar instalación
```

### 2. Instalar Dependencias
```bash
cd backend
npm install
```

### 3. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus datos
```

### 4. Obtener Credenciales de Mercado Pago

#### Para Desarrollo (Pruebas):
1. Ir a https://www.mercadopago.com.ar/developers
2. Crear cuenta o iniciar sesión
3. Ir a "Tus aplicaciones" > "Crear aplicación"
4. Nombre: "Food Panda Test"
5. Seleccionar "Web"
6. Copiar las credenciales TEST:
   - Access Token: TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   - Public Key: TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

#### Para Producción:
1. Solicitar credenciales de producción
2. Configurar URLs de callback
3. Verificar cuenta de Mercado Pago

### 5. Configurar Email (Gmail)
```bash
# Usar App Password de Google
# 1. Activar 2FA en cuenta Google
# 2. Ir a https://myaccount.google.com/apppasswords
# 3. Generar contraseña para "Food Panda Backend"
# 4. Usar esa contraseña en EMAIL_PASS
```

### 6. Configurar Google Maps API (Opcional)
```bash
# Para cálculo preciso de distancia
# 1. Ir a https://console.cloud.google.com/
# 2. Crear proyecto o seleccionar existente
# 3. Habilitar "Distance Matrix API"
# 4. Crear API Key
# 5. Agregar a GOOGLE_MAPS_API_KEY
```

## Configuración del Archivo .env

```env
# Mercado Pago (REEMPLAZAR con tus credenciales)
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database
DB_PATH=./database.sqlite

# Email Configuration (REEMPLAZAR con tus datos)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-app
EMAIL_RESTAURANTE=restaurante@foodpanda.com

# Server Configuration
PORT=3001
NODE_ENV=development

# Google Maps API (Opcional)
GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Restaurant Location (para cálculo de envío)
RESTAURANT_LAT=-27.3667
RESTAURANT_LNG=-55.9167

# Delivery Cost Configuration
DELIVERY_COST_PER_KM=50
MIN_DELIVERY_COST=200
FREE_DELIVERY_THRESHOLD=5000
```

## Ejecutar el Backend

### Desarrollo
```bash
npm run dev
# Servidor corriendo en http://localhost:3001
```

### Producción
```bash
npm start
```

## Endpoints del API

### 1. Crear Pago
```
POST /api/mercadopago/crear-pago
Content-Type: application/json

{
  "cart": [
    {
      "name": "Empanadas de Carne",
      "price": 2600,
      "quantity": 2
    }
  ],
  "customerData": {
    "name": "Juan Pérez",
    "phone": "3758123456",
    "address": "Calle 123",
    "postalCode": "3300"
  },
  "orderType": "delivery",
  "deliveryCost": 200,
  "paymentMethod": "mercadopago"
}
```

**Respuesta:**
```json
{
  "success": true,
  "orderId": "uuid-del-pedido",
  "paymentUrl": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...",
  "preferenceId": "preference-id"
}
```

### 2. Calcular Costo de Envío
```
POST /api/delivery/calcular-costo
Content-Type: application/json

{
  "address": "Calle 123, Posadas, Misiones",
  "cartTotal": 5000
}
```

**Respuesta:**
```json
{
  "success": true,
  "distance": 2.5,
  "deliveryCost": 200,
  "freeDelivery": true,
  "estimatedTime": 30
}
```

### 3. Webhook de Mercado Pago
```
POST /api/mercadopago/webhook
Content-Type: application/json

{
  "type": "payment",
  "data": {
    "id": "payment_id"
  }
}
```

## Flujo Completo del Sistema

### Flujo de Pago con Mercado Pago:
1. **Frontend** envía datos del pedido a `/crear-pago`
2. **Backend** crea pedido en base de datos (status: pendiente_pago_mp)
3. **Backend** crea preferencia en Mercado Pago
4. **Frontend** redirige a Mercado Pago
5. **Cliente** paga en Mercado Pago
6. **Mercado Pago** notifica al webhook
7. **Backend** actualiza pedido a "pagado"
8. **Backend** envía email al restaurante

### Flujo de Pago en Efectivo:
1. **Frontend** envía datos a `/crear-pago` con paymentMethod: "efectivo"
2. **Backend** crea pedido (status: pendiente_pago_efectivo)
3. **Backend** envía email inmediato al restaurante
4. **Frontend** muestra confirmación al cliente

## Configuración de Mercado Pago

### URLs de Callback (Producción):
```
Success URL: https://tusitio.com/pedido-exito
Failure URL: https://tusitio.com/pedido-error
Pending URL: https://tusitio.com/pedido-pendiente
Webhook URL: https://tubackend.com/api/mercadopago/webhook
```

### Webhook Configuration:
1. Ir a la aplicación en Mercado Pago
2. Configurar "Webhooks"
3. Agregar URL: `https://tubackend.com/api/mercadopago/webhook`
4. Seleccionar eventos: "payment"

## Base de Datos

### Tabla Orders:
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  customer_postal_code TEXT,
  cart TEXT NOT NULL,
  order_type TEXT NOT NULL,
  delivery_cost REAL DEFAULT 0,
  products_total REAL NOT NULL,
  total REAL NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_id TEXT,
  payment_status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME
);
```

### Estados de Pedido:
- `pendiente_pago_mp`: Esperando pago online
- `pendiente_pago_efectivo`: Pedido con pago en efectivo
- `pagado`: Pago confirmado
- `preparando`: En preparación
- `listo`: Listo para entrega/retiro
- `entregado`: Entregado
- `cancelado`: Cancelado

## Email de Notificación

El sistema envía emails automáticos al restaurante con:
- **Todos los datos del cliente**
- **Productos solicitados**
- **Total del pedido**
- **Tipo de entrega**
- **Estado del pago**

### Formato del Email:
- HTML profesional con diseño blanco/negro
- Información completa del pedido
- Contacto del cliente
- Estado del pedido

## Seguridad

### Medidas Implementadas:
- **CORS** configurado para frontend específico
- **Rate limiting** para prevenir abusos
- **Helmet** para seguridad HTTP
- **Validación de datos** en todos los endpoints
- **Variables de entorno** para credenciales

### Recomendaciones Adicionales:
- Usar HTTPS en producción
- Configurar firewall
- Monitorear logs del servidor
- Backup regular de base de datos

## Testing

### Pruebas Locales:
```bash
# Testear endpoint de creación de pago
curl -X POST http://localhost:3001/api/mercadopago/crear-pago \
  -H "Content-Type: application/json" \
  -d '{
    "cart": [{"name": "Test", "price": 100, "quantity": 1}],
    "customerData": {"name": "Test", "phone": "123"},
    "orderType": "retiro",
    "paymentMethod": "efectivo"
  }'
```

### Pruebas de Mercado Pago:
1. Usar credenciales TEST
2. Realizar pagos de prueba
3. Verificar webhook con ngrok:
   ```bash
   ngrok http 3001
   # Usar URL de ngrok en webhook de Mercado Pago
   ```

## Deploy a Producción

### Opción 1: Vercel (Recomendado)
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Configurar vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}

# 3. Deploy
vercel --prod
```

### Opción 2: Railway
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up
```

### Opción 3: Heroku
```bash
# 1. Crear app
heroku create foodpanda-backend

# 2. Configurar variables
heroku config:set MERCADO_PAGO_ACCESS_TOKEN=xxx
heroku config:set MERCADO_PAGO_PUBLIC_KEY=xxx

# 3. Deploy
git push heroku main
```

## Monitoreo y Logs

### Logs del Servidor:
```bash
# En desarrollo
npm run dev

# En producción con PM2
pm2 logs foodpanda-backend
pm2 monit
```

### Métricas Importantes:
- Pedidos por día
- Tasa de conversión
- Errores de pago
- Tiempos de respuesta

## Solución de Problemas Comunes

### Error: "Invalid access token"
- Verificar credenciales de Mercado Pago
- Usar credenciales TEST para desarrollo

### Error: "CORS policy"
- Verificar FRONTEND_URL en .env
- Configurar CORS correctamente

### Error: "Email not sent"
- Verificar configuración de Gmail
- Usar App Password (no contraseña normal)

### Error: "Database locked"
- Verificar permisos del archivo database.sqlite
- Reiniciar servidor

## Soporte y Mantenimiento

### Actualizaciones:
- Actualizar dependencias regularmente
- Monitorear cambios en API de Mercado Pago
- Backup semanal de base de datos

### Contacto:
- Documentación: https://www.mercadopago.com.ar/developers
- Soporte: soporte@mercadopago.com
- Issues: Crear en GitHub del proyecto

---

## Checklist de Producción

- [ ] Credenciales de Mercado Pago (producción)
- [ ] URLs de callback configuradas
- [ ] Email con App Password
- [ ] HTTPS activado
- [ ] Base de datos inicializada
- [ ] Webhook probado con ngrok
- [ ] Rate limiting configurado
- [ ] Logs habilitados
- [ ] Backup automático
- [ ] Monitoreo configurado

¡Listo para producción! El sistema está completamente funcional y profesional.
