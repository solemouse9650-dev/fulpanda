# Cómo Obtener Credenciales de Mercado Pago (Paso a Paso)

## Método 1: Usando tus credenciales existentes

Ya tienes credenciales (APP_USR) pero están mal configuradas. Para usarlas:

1. **Ve a**: https://www.mercadopago.com.ar/developers
2. **Inicia sesión** con tu cuenta de Mercado Pago
3. **Ve a "Tus aplicaciones"**
4. **Busca tu aplicación** (debería aparecer una)
5. **Copia las credenciales correctas**:
   - **Access Token**: El token completo que empieza con APP_USR
   - **Public Key**: La clave pública que empieza con APP_USR

## Método 2: Crear nuevas credenciales de prueba

Si prefieres usar credenciales de prueba:

1. **Ve a**: https://www.mercadopago.com.ar/developers
2. **Haz clic en "Crear aplicación"**
3. **Completa los datos**:
   - Nombre: "Food Panda Test"
   - Descripción: "Sistema de pedidos para restaurante"
   - Sitio web: `http://localhost:8000`
4. **Selecciona "Web"**
5. **Haz clic en "Crear"**
6. **Copia las credenciales** que aparecen

## Formato Correcto de las Credenciales

Las credenciales deben tener este formato:

```
# Para pruebas (TEST)
MERCADO_PAGO_ACCESS_TOKEN=TEST-1234567890123456-123456789-abcdef1234567890abcdef1234567890-123456789
MERCADO_PAGO_PUBLIC_KEY=TEST-abcdef1234-5678-90ab-cdef-1234567890ab

# Para producción (APP_USR)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-1234567890123456-123456789-abcdef1234567890abcdef1234567890-123456789
MERCADO_PAGO_PUBLIC_KEY=APP_USR-abcdef1234-5678-90ab-cdef-1234567890ab
```

## Verificación

Después de configurar las credenciales, reinicia el servidor:

```bash
# Detener servidor actual
taskkill /F /IM node.exe

# Iniciar servidor
node server.js
```

Deberías ver:
```
Mercado Pago configurado correctamente
Access Token: APP_USR-1234...
Servidor corriendo en puerto 3002
Entorno: development
```

## Si no funciona

1. **Verifica que el access token no esté vacío**
2. **Asegúrate de copiar todo el token completo**
3. **No incluyas espacios ni caracteres extra**
4. **Reinicia el servidor después de cambiar las credenciales**

## Credenciales de Ejemplo (NO USAR - solo para referencia)

```
# ESTAS SON SOLO REFERENCIA - NO FUNCIONAN
MERCADO_PAGO_ACCESS_TOKEN=TEST-2155688738177033-041218-6e4386a9c8998a571b5f6e1a289f5f5-3330256767
MERCADO_PAGO_PUBLIC_KEY=TEST-9a6b8c7d-1e2f-3a4b-5c6d-7e8f9a0b1c2d
```

## Una vez que tengas tus credenciales

1. **Edita el archivo .env**
2. **Reemplaza las líneas de MERCADO_PAGO_ACCESS_TOKEN y MERCADO_PAGO_PUBLIC_KEY**
3. **Guarda el archivo**
4. **Reinicia el servidor**
5. **Prueba el sistema**

## Importante

- **Las credenciales de prueba** solo funcionan en desarrollo
- **Las credenciales de producción** requieren HTTPS y dominio real
- **Nunca compartas tus credenciales** en público
- **Guarda tus credenciales en un lugar seguro**
