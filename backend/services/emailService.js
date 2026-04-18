const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOrderNotification(order) {
    try {
      const emailContent = this.generateOrderEmail(order);
      
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RESTAURANTE,
        subject: `Nuevo Pedido - ${order.orderType.toUpperCase()} - ${order.customerData.name}`,
        html: emailContent
      });

      console.log('Email de notificación enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar email de notificación:', error);
    }
  }

  generateOrderEmail(order) {
    const isDelivery = order.orderType === 'delivery';
    const paymentMethodText = order.paymentMethod === 'efectivo' ? 'Efectivo' : 'Mercado Pago';
    
    let emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo Pedido - Food Panda</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #000; margin: 0; font-size: 28px; }
          .order-info { background: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .order-info h3 { margin-top: 0; color: #000; }
          .customer-info { background: #f0f0f0; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .items-table th { background: #000; color: white; }
          .items-table tr:nth-child(even) { background: #f9f9f9; }
          .total { font-size: 20px; font-weight: bold; text-align: right; margin: 20px 0; }
          .status { padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; margin: 20px 0; }
          .status.pendiente { background: #fff3cd; color: #856404; }
          .status.pagado { background: #d4edda; color: #155724; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FOOD PANDA</h1>
            <h2>Nuevo Pedido Recibido</h2>
          </div>

          <div class="order-info">
            <h3>Información del Pedido</h3>
            <p><strong>ID del Pedido:</strong> ${order.id}</p>
            <p><strong>Tipo:</strong> ${isDelivery ? 'Delivery' : 'Retiro en Local'}</p>
            <p><strong>Método de Pago:</strong> ${paymentMethodText}</p>
            <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString('es-AR')}</p>
            <p><strong>Estado:</strong> ${order.status}</p>
            ${isDelivery ? `<p><strong>Costo de Envío:</strong> $${order.deliveryCost}</p>` : ''}
            <p><strong>Total del Pedido:</strong> $${order.total}</p>
          </div>

          <div class="customer-info">
            <h3>Datos del Cliente</h3>
            <p><strong>Nombre:</strong> ${order.customerData.name}</p>
            <p><strong>Teléfono:</strong> ${order.customerData.phone}</p>
            ${isDelivery ? `
              <p><strong>Dirección:</strong> ${order.customerData.address || 'No especificada'}</p>
              <p><strong>Código Postal:</strong> ${order.customerData.postalCode || 'No especificado'}</p>
            ` : ''}
          </div>

          <h3>Productos Solicitados</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
    `;

    // Agregar items del carrito
    order.cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      emailHTML += `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>$${item.price}</td>
          <td>$${subtotal}</td>
        </tr>
      `;
    });

    emailHTML += `
            </tbody>
          </table>

          <div class="total">
            Total: $${order.total}
          </div>

          <div class="status ${order.status === 'pagado' ? 'pagado' : 'pendiente'}">
            ${order.status === 'pagado' ? 'PEDIDO PAGADO - PREPARAR PARA ENTREGA' : 'PEDIDO PENDIENTE DE PAGO'}
          </div>

          <div class="footer">
            <p>Este es un mensaje automático de Food Panda</p>
            <p>Por favor contactar al cliente si hay alguna consulta</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return emailHTML;
  }

  async sendPaymentConfirmation(order) {
    try {
      const emailContent = `
        <h2>Confirmación de Pago Recibida</h2>
        <p>El pedido #${order.id} ha sido pagado exitosamente.</p>
        <p>Total: $${order.total}</p>
        <p>Por favor preparar el pedido para entrega.</p>
      `;
      
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RESTAURANTE,
        subject: `Confirmación de Pago - Pedido #${order.id}`,
        html: emailContent
      });

      console.log('Email de confirmación de pago enviado');
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error);
    }
  }
}

module.exports = new EmailService();
