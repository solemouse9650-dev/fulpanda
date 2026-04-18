const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Order {
  constructor() {
    this.dbPath = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');
    this.db = new sqlite3.Database(this.dbPath);
    this.initDatabase();
  }

  initDatabase() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
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
      )
    `;

    this.db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error al crear tabla de pedidos:', err);
      } else {
        console.log('Tabla de pedidos verificada/creada');
      }
    });
  }

  async save(orderData) {
    return new Promise((resolve, reject) => {
      // Validar que orderData no sea undefined
      if (!orderData) {
        return reject(new Error('orderData es undefined'));
      }

      const query = `
        INSERT INTO orders (
          id, customer_name, customer_phone, customer_address, 
          customer_postal_code, cart, order_type, delivery_cost,
          products_total, total, payment_method, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        orderData.id,
        orderData.customerData.name,
        orderData.customerData.phone,
        orderData.customerData.address || null,
        orderData.customerData.postalCode || null,
        JSON.stringify(orderData.cart),
        orderData.orderType,
        orderData.deliveryCost,
        orderData.productsTotal,
        orderData.total,
        orderData.paymentMethod,
        orderData.status
      ];

      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: orderData.id, success: true });
        }
      });
    });
  }

  async findById(orderId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM orders WHERE id = ?';
      
      this.db.get(query, [orderId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          // Parsear el cart de vuelta a objeto
          const order = {
            ...row,
            cart: JSON.parse(row.cart),
            customerData: {
              name: row.customer_name,
              phone: row.customer_phone,
              address: row.customer_address,
              postalCode: row.customer_postal_code
            }
          };
          resolve(order);
        } else {
          resolve(null);
        }
      });
    });
  }

  async updateStatus(orderId, status, additionalData = {}) {
    return new Promise((resolve, reject) => {
      let query = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP';
      let values = [status];

      if (additionalData.paymentId) {
        query += ', payment_id = ?';
        values.push(additionalData.paymentId);
      }

      if (additionalData.paymentStatus) {
        query += ', payment_status = ?';
        values.push(additionalData.paymentStatus);
      }

      if (additionalData.paidAt) {
        query += ', paid_at = ?';
        values.push(additionalData.paidAt);
      }

      query += ' WHERE id = ?';
      values.push(orderId);

      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, changes: this.changes });
        }
      });
    });
  }

  async getAll(limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?';
      
      this.db.all(query, [limit, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const orders = rows.map(row => ({
            ...row,
            cart: JSON.parse(row.cart),
            customerData: {
              name: row.customer_name,
              phone: row.customer_phone,
              address: row.customer_address,
              postalCode: row.customer_postal_code
            }
          }));
          resolve(orders);
        }
      });
    });
  }

  async getByStatus(status) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC';
      
      this.db.all(query, [status], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const orders = rows.map(row => ({
            ...row,
            cart: JSON.parse(row.cart),
            customerData: {
              name: row.customer_name,
              phone: row.customer_phone,
              address: row.customer_address,
              postalCode: row.customer_postal_code
            }
          }));
          resolve(orders);
        }
      });
    });
  }
}

module.exports = Order;
