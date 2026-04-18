# Food Panda - Website de Restaurante

Un sitio web profesional y moderno para el restaurante Food Panda con todas las características solicitadas.

## Características Implementadas

### Diseño y Tema
- **Tema blanco y negro** elegante y profesional
- **Diseño responsive** para todos los dispositivos (móviles, tablets, desktop)
- **SEO optimizado** con meta tags y estructura semántica
- **Animaciones suaves** y transiciones modernas

### Secciones del Sitio Web

1. **Navegación Fija**
   - Logo del restaurante
   - Menú de navegación con enlaces a todas las secciones
   - Menú hamburguesa para dispositivos móviles

2. **Introducción (Hero Section)**
   - Nombre del local "Food Panda"
   - Descripción del negocio
   - Imagen de fondo con efecto overlay
   - Botones de acción

3. **Sobre Nosotros**
   - Información detallada del restaurante
   - Imagen del local
   - Características destacadas

4. **Galería**
   - Grid de imágenes con efectos hover
   - Imágenes de comidas, bebidas y el local
   - Efecto de escala y filtro en hover

5. **Menú Interactivo**
   - **Categorías**: Entradas, Platos Principales, Bebidas, Postres
   - Sistema de tabs para cambiar entre categorías
   - Cada ítem incluye:
     - Nombre, descripción y precio
     - Botón "Comprar" (abre modal de cantidad)
     - Botón "Agregar al Carrito"

6. **Sistema de Compras**
   - **Modal de Compra**: Seleccionar cantidad y ver total
   - **Carrito de Compras**: 
     - Icono flotante con contador
     - Dropdown con todos los items agregados
     - Total acumulado
     - Botón para eliminar items
     - Botón "Finalizar Compra"

7. **Ubicación y Horarios**
   - **Mapa integrado** de Google Maps
   - **Tabla de horarios** por día
   - **Indicador en tiempo real** de abierto/cerrado
   - Se actualiza automáticamente cada minuto

8. **Sistema de Reservas**
   - Formulario con:
     - Nombre
     - Selección de fecha (mínimo fecha actual)
     - Selección de hora
     - Cantidad de personas
   - Envío directo a WhatsApp

9. **Contacto y Redes Sociales**
   - Botón de WhatsApp con diseño oficial
   - Botón de Instagram con diseño oficial
   - Información de contacto

10. **Footer**
    - Enlaces de navegación
    - Política de privacidad
    - Términos y condiciones

### Botones Flotantes
- **WhatsApp Reservas**: En la esquina inferior derecha
- **Cómo Llegar**: Abre Google Maps con la ubicación

## Funcionalidades Técnicas

### Carrito de Compras
- Almacenamiento local (localStorage) para persistencia
- Cálculo automático de totales
- Notificaciones visuales de acciones
- Integración con WhatsApp para pedidos

### Sistema de Reservas
- Validación de fecha (no permite fechas pasadas)
- Formato automático de mensaje para WhatsApp
- Confirmación visual de envío

### Estado del Restaurante
- Actualización automática cada 60 segundos
- Lógica de horarios por día de la semana
- Indicador visual (verde/rojo)

### Optimizaciones
- **Performance**: Debounce para eventos scroll
- **Accesibilidad**: ARIA labels, navegación por teclado
- **SEO**: Meta tags Open Graph, estructura semántica
- **Mobile First**: Diseño responsive progresivo

## Archivos del Proyecto

```
ulpaasn/
|-- index.html          # Estructura HTML principal
|-- styles.css          # Estilos CSS con tema blanco/negro
|-- script.js           # Funcionalidad JavaScript completa
|-- README.md           # Este archivo de documentación
|-- assets/             # Carpeta para imágenes (crear)
|   |-- logo.png        # Logo del restaurante
|   |-- hero-bg.jpg     # Imagen de fondo hero
|   |-- about-image.jpg # Imagen sección sobre nosotros
|   |-- gallery1.jpg    # Imágenes galería
|   |-- gallery2.jpg
|   |-- gallery3.jpg
|   |-- gallery4.jpg
|   |-- gallery5.jpg
|   |-- gallery6.jpg
|   |-- favicon.ico     # Icono del sitio
```

## Configuración del WhatsApp

El sitio está configurado para enviar mensajes al número:
- **Teléfono**: +54 3758 502801
- **URL**: https://wa.me/543758502801

### Mensajes Automáticos

**Pedidos**: 
```
¡Hola! Quiero realizar un pedido:
2x Empanadas de Carne - $5.200
1x Coca-Cola - $2.200
Total: $7.400

¿Podrían confirmar mi pedido?
```

**Reservas**:
```
¡Hola! Quiero hacer una reserva:
Nombre: Juan Pérez
Fecha: 2024-12-25
Hora: 20:00
Cantidad de personas: 4

¿Hay disponibilidad para esta fecha y hora?
```

## Personalización

### Cambiar Número de WhatsApp
Buscar en `script.js` las líneas:
```javascript
const whatsappUrl = `https://wa.me/543758502801?text=${encodeURIComponent(message)}`;
```

### Cambiar Horarios
En `script.js`, modificar el objeto `openingHours`:
```javascript
const openingHours = {
    0: { open: 10 * 60, close: 22 * 60 }, // Domingo: 10:00 - 22:00
    // ... otros días
};
```

### Cambiar Ubicación del Mapa
En `index.html`, actualizar el iframe del mapa:
```html
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!..."></iframe>
```

### Agregar/Eliminar Items del Menú
En `index.html`, modificar las secciones `.menu-category`:
```html
<div class="menu-item">
    <div class="item-info">
        <h3>Nombre del Plato</h3>
        <p>Descripción</p>
        <span class="price">$Precio</span>
    </div>
    <div class="item-actions">
        <button class="btn-buy" data-item="Nombre del Plato" data-price="precio">Comprar</button>
        <button class="btn-add-cart" data-item="Nombre del Plato" data-price="precio">Agregar al Carrito</button>
    </div>
</div>
```

## Imágenes Necesarias

Para que el sitio funcione completamente, necesitas agregar las siguientes imágenes a una carpeta `assets/`:

1. **logo.png** - Logo de Food Panda (recomendado 200x50px)
2. **hero-bg.jpg** - Imagen de fondo para la sección principal (1920x1080px)
3. **about-image.jpg** - Foto del restaurante (800x600px)
4. **gallery1.jpg** a **gallery6.jpg** - Imágenes para la galería (400x300px)
5. **favicon.ico** - Icono del sitio (32x32px)

## Instalación

1. **Colocar los archivos** en tu servidor web
2. **Agregar las imágenes** en la carpeta `assets/`
3. **Configurar el número de WhatsApp** si es diferente
4. **Actualizar la ubicación del mapa** si es necesario
5. **Probar todas las funcionalidades**

## Compatibilidad

- **Navegadores modernos**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Móviles, Tablets, Desktop
- **Resolución mínima**: 320px (móviles pequeños)

## Características de SEO

- Meta tags optimizados
- Estructura semántica HTML5
- Open Graph tags para redes sociales
- URLs amigables
- Imágenes con alt text
- Performance optimizada

## Soporte

El sitio incluye:
- Manejo de errores
- Notificaciones visuales
- Validación de formularios
- Accesibilidad
- Modo offline (localStorage)

---

**Food Panda** - Sitio web profesional creado con HTML5, CSS3 y JavaScript vanilla.
