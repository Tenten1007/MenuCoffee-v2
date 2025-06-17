const pool = require('../config/database');

// Create a new order
exports.create = async (req, res) => {
  try {
    const { customerName, items } = req.body;
    
    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: 'ข้อมูลไม่ถูกต้อง: ต้องระบุชื่อลูกค้าและรายการสินค้า' 
      });
    }

    const total = items.reduce((sum, item) => {
      if (!item.price || !item.quantity) {
        throw new Error('ข้อมูลสินค้าไม่ถูกต้อง: ต้องระบุราคาและจำนวน');
      }
      return sum + (item.price * item.quantity);
    }, 0);
    
    // Start a transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert the main order into the orders table
      const [orderResult] = await connection.query(
        'INSERT INTO orders (customerName, status, total) VALUES (?, ?, ?)',
        [customerName, 'รอดำเนินการ', total]
      );
      const orderId = orderResult.insertId;

      // Insert each item into the order_items table
      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, name, price, quantity, sweetness, temperature, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [orderId, item.name, item.price, item.quantity, item.sweetness, item.temperature, item.note]
        );
      }

      await connection.commit();

      // Fetch the created order with its items for the response
      const [newOrder] = await connection.query(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );
      const [newOrderItems] = await connection.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId]
      );

      const responseOrder = { ...newOrder[0], items: newOrderItems };

      // Emit a Socket.IO event for the new order
      const io = req.app.get('socketio');
      io.emit('newOrder', responseOrder);

      console.log('Order created successfully:', responseOrder);
      res.status(201).json(responseOrder);
    } catch (transactionError) {
      await connection.rollback();
      throw transactionError; // Re-throw to be caught by outer catch block
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all orders (adjust to include items)
exports.findAll = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders ORDER BY orderTime DESC'
    );
    
    const formattedOrders = await Promise.all(orders.map(async (order) => {
      const [items] = await pool.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      return {
        ...order,
        orderTime: order.orderTime ? new Date(order.orderTime).toISOString() : null,
        items: items,
        totalAmount: order.total
      };
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single order (adjust to include items)
exports.findOne = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'ไม่พบออเดอร์' });
    }

    const order = orders[0];
    const [items] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );

    const formattedOrder = {
      ...order,
      orderTime: order.orderTime ? new Date(order.orderTime).toISOString() : null,
      items: items,
      totalAmount: order.total
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update an order
exports.update = async (req, res) => {
  try {
    const { status } = req.body;
    
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบออเดอร์' });
    }

    const [updatedOrder] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedOrder[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete an order
exports.delete = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบออเดอร์' });
    }

    res.json({ message: 'ลบออเดอร์สำเร็จ' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: error.message });
  }
}; 