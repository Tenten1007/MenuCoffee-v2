const db = require('../config/db.config');

const Order = {
  async create(orderData) {
    const { customerName, items, status, orderTime } = orderData;
    const [result] = await db.query(
      'INSERT INTO orders (customer_name, items, status, order_time) VALUES (?, ?, ?, ?)',
      [customerName, JSON.stringify(items), status, orderTime]
    );
    return result.insertId;
  },

  async findAll() {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY order_time DESC');
    return orders.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));
  },

  async findById(id) {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) return null;
    return {
      ...orders[0],
      items: JSON.parse(orders[0].items)
    };
  },

  async updateStatus(id, status) {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Order; 