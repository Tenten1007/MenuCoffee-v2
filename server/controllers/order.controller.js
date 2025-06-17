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
    
    console.log('Creating order with data:', {
      customerName,
      items: JSON.stringify(items),
      total
    });

    const [result] = await pool.query(
      'INSERT INTO orders (customerName, items, status, total, orderTime) VALUES (?, ?, ?, ?, NOW())',
      [customerName, JSON.stringify(items), 'รอดำเนินการ', total]
    );

    const [newOrder] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [result.insertId]
    );

    console.log('Order created successfully:', newOrder[0]);
    res.status(201).json(newOrder[0]);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all orders
exports.findAll = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders ORDER BY orderTime DESC'
    );
    // Convert orderTime to ISO string for consistent parsing on client-side
    const formattedOrders = orders.map(order => ({
      ...order,
      orderTime: order.orderTime ? new Date(order.orderTime).toISOString() : null,
      // Also ensure items and total are correctly handled if they were part of the issue
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      customerName: order.customerName, // Map customerName to customerName
      totalAmount: order.total // Map total to totalAmount
    }));
    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single order
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
    // Convert orderTime to ISO string and adjust other fields
    const formattedOrder = {
      ...order,
      orderTime: order.orderTime ? new Date(order.orderTime).toISOString() : null,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      customerName: order.customerName, // Map customerName to customerName
      totalAmount: order.total // Map total to totalAmount
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