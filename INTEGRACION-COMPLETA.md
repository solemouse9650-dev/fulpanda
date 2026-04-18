# Guía de Integración Completa - Food Panda

## Resumen del Proyecto

Has transformado completamente tu web de Food Panda de un sistema básico con WhatsApp a un **sistema profesional de pedidos y pagos** con:

- **Mercado Pago** integrado para pagos online
- **Cálculo automático** de costo de envío
- **Flujo completo** de pedidos (delivery/retiro)
- **Base de datos** para gestionar todo
- **Notificaciones automáticas** al restaurante

## Cambios Realizados

### 1. Backend Completo
- **Node.js + Express** con arquitectura profesional
- **Mercado Pago SDK** oficial
- **SQLite** para base de datos
- **Email service** con Gmail
- **Webhooks** para confirmaciones de pago

### 2. Frontend Actualizado
- **Reemplazado** el botón de WhatsApp
- **Nuevo flujo** de selección de tipo de pedido
- **Formularios** para datos de cliente
- **Cálculo** de costo de envío en tiempo real
- **Selección** de método de pago

### 3. Flujo de Usuario
1. **Finalizar compra** (antes iba a WhatsApp)
2. **Seleccionar tipo**: Delivery o Retiro
3. **Completar datos**: Nombre, teléfono, dirección (si delivery)
4. **Calcular envío**: Automático basado en distancia
5. **Método de pago**: Mercado Pago o Efectivo
6. **Procesar pago**: Redirección o confirmación

## Estructura Final del Proyecto

```
ulpaasn/
|-- index.html              # Frontend actualizado
|-- styles.css              # Estilos con nuevos modales
|-- script.js               # JavaScript con nuevo flujo
|-- assets/                 # Imágenes SVG
|-- backend/                # Nuevo backend completo
|   |-- package.json
|   |-- server.js
|   |-- .env.example
|   |-- config/mercadopago.js
|   |-- models/Order.js
|   |-- routes/
|   |-- services/emailService.js
|   |-- README-BACKEND.md
|-- README.md               # Documentación original
|-- INTEGRACION-COMPLETA.md # Este archivo
```

## Pasos para Poner en Producción

### Paso 1: Configurar Backend

```bash
# 1. Ir a la carpeta backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Copiar y configurar variables de entorno
cp .env.example .env

# 4. Editar .env con tus credenciales
```

### Paso 2: Obtener Credenciales de Mercado Pago

#### Para Desarrollo (Pruebas):
1. Ir a https://www.mercadopago.com.ar/developers
2. Crear aplicación "Food Panda Test"
3. Copiar credenciales TEST:
   - Access Token: `TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Public Key: `TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### Para Producción:
1. Solicitar credenciales de producción
2. Configurar URLs en Mercado Pago

### Paso 3: Configurar Email

```bash
# Usar Gmail con App Password
# 1. Activar 2FA en cuenta Google
# 2. Generar App Password en: https://myaccount.google.com/apppasswords
# 3. Usar esa contraseña en EMAIL_PASS
```

### Paso 4: Configurar Variables de Entorno

Edita el archivo `.env`:

```env
# Mercado Pago (REEMPLAZAR)
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email (REEMPLAZAR)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-app
EMAIL_RESTAURANTE=restaurante@foodpanda.com

# Server
PORT=3001
NODE_ENV=development

# Delivery (ajustar según tu zona)
RESTAURANT_LAT=-27.3667
RESTAURANT_LNG=-55.9167
DELIVERY_COST_PER_KM=50
MIN_DELIVERY_COST=200
FREE_DELIVERY_THRESHOLD=5000
```

### Paso 5: Iniciar Backend

```bash
# Para desarrollo
npm run dev

# Para producción
npm start
```

El backend correrá en: `http://localhost:3001`

### Paso 6: Probar el Sistema

1. **Iniciar frontend**: `python -m http.server 8000`
2. **Iniciar backend**: `npm run dev`
3. **Abrir**: `http://localhost:8000`
4. **Agregar productos** al carrito
5. **Hacer clic** en "Finalizar compra"
6. **Probar** el flujo completo

## Flujo Completo de Prueba

### Test 1: Retiro en Local + Efectivo
1. Agregar productos al carrito
2. Finalizar compra
3. Seleccionar "Retiro en Local"
4. Completar nombre y teléfono
5. Seleccionar "Efectivo"
6. **Resultado**: Pedido registrado, email enviado al restaurante

### Test 2: Delivery + Mercado Pago
1. Agregar productos al carrito
2. Finalizar compra
3. Seleccionar "Delivery"
4. Completar datos completos
5. Calcular costo de envío
6. Seleccionar "Mercado Pago"
7. **Resultado**: Redirección a Mercado Pago para pagar

### Test 3: Webhook de Mercado Pago
1. Pagar en Mercado Pago (test)
2. Verificar email de confirmación
3. Revisar base de datos: pedido marcado como "pagado"

## Deploy a Producción

### Opción 1: Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Configurar vercel.json en backend/
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

# 3. Deploy backend
cd backend
vercel --prod

# 4. Configurar variables de entorno en Vercel
vercel env add MERCADO_PAGO_ACCESS_TOKEN
vercel env add EMAIL_USER
# ... etc
```

### Opción 2: GitHub Pages + Vercel

```bash
# 1. Subir frontend a GitHub Pages
# 2. Deploy backend en Vercel
# 3. Actualizar URLs en frontend
```

### Opción 3: Railway

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login y deploy
railway login
cd backend
railway up
```

## URLs de Configuración

### Mercado Pago (Producción):
```
Frontend URL: https://tu-usuario.github.io/ulpaasn/
Backend URL: https://tu-backend.vercel.app/
Success URL: https://tu-usuario.github.io/ulpaasn/pedido-exito
Failure URL: https://tu-usuario.github.io/ulpaasn/pedido-error
Webhook URL: https://tu-backend.vercel.app/api/mercadopago/webhook
```

### Actualizar Frontend:
En `script.js`, cambiar:
```javascript
const response = await fetch('https://tu-backend.vercel.app/api/mercadopago/crear-pago', {
```

## Monitoreo y Mantenimiento

### Logs del Backend:
```bash
# En Vercel
vercel logs

# En Railway
railway logs
```

### Base de Datos:
- Archivo: `database.sqlite`
- Backup regular recomendado
- Puedes usar SQLite browser para revisar

### Emails Recibidos:
- Pedidos en efectivo: Inmediatos
- Pagos online: Después de confirmación de Mercado Pago

## Costos Operativos

### Mercado Pago:
- **Gratis** para integrar
- **Comisión**: ~3.99% + IVA por pago online
- **Efectivo**: Sin comisión

### Hosting:
- **Frontend (GitHub Pages)**: Gratis
- **Backend (Vercel)**: Gratis hasta cierto uso
- **Email (Gmail)**: Gratis

### Total estimado: **$0 - $50/mes** según volumen

## Seguridad

### Medidas Implementadas:
- **HTTPS** obligatorio en producción
- **CORS** configurado
- **Rate limiting** para prevenir abusos
- **Validación** de todos los datos
- **Variables de entorno** para credenciales

### Recomendaciones:
- No subir `.env` a GitHub
- Usar credenciales de producción solo en producción
- Monitorear logs regularmente

## Soporte y Mejoras

### Problemas Comunes:

#### "Error al conectar con backend"
- Verificar que backend esté corriendo
- Revisar CORS configuration
- Confirmar URLs correctas

#### "Error en Mercado Pago"
- Verificar credenciales
- Usar credenciales TEST para desarrollo
- Revisar webhook configuration

#### "Email no enviado"
- Verificar Gmail App Password
- Revisar SMTP settings
- Confirmar email del restaurante

### Mejoras Futuras:
- Panel de administración para ver pedidos
- SMS notifications al cliente
- Integración con delivery apps
- Sistema de calificaciones
- Programa de fidelización

## Checklist Final de Producción

- [ ] Backend deployado y funcionando
- [ ] Credenciales de Mercado Pago configuradas
- [ ] Webhook de Mercado Pago activo
- [ ] Email service funcionando
- [ ] Frontend actualizado con URLs de producción
- [ ] Tests completados exitosamente
- [ ] HTTPS activado
- [ ] Monitoreo configurado
- [ ] Backup programado
- [ ] Documentación completa

## Resumen del Cambio

### Antes:
- Botón "Finalizar compra" -> WhatsApp
- Manual y propenso a errores
- Sin seguimiento de pedidos
- Sin pagos online

### Después:
- Flujo profesional completo
- Pagos online con Mercado Pago
- Cálculo automático de envío
- Base de datos de pedidos
- Notificaciones automáticas
- Sistema escalable y profesional

¡Tu web de Food Panda ahora es un sistema profesional de pedidos comparable a los mejores restaurantes!

---

## Contacto de Soporte

Para cualquier duda o problema:
1. Revisar `backend/README-BACKEND.md`
2. Verificar logs del servidor
3. Probar con credenciales TEST primero
4. Usar herramientas de desarrollador del navegador

¡Éxito con tu nuevo sistema de pedidos!
