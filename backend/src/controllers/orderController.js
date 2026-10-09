const db = require('../config/db');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

const createOrder = async (req, res) => {
  const { items, total_amount } = req.body;
  const customerId = req.user.id;

  if (!items || items.length === 0 || !total_amount) {
    return res.status(400).json({ message: 'Cart items and total amount are required' });
  }

  try {
    // 1. Insert order into the database (default: Pending, Pending payment)
    const [orderResult] = await db.query(
      'INSERT INTO orders (customer_id, total_amount, status, payment_status) VALUES (?, ?, ?, ?)',
      [customerId, parseFloat(total_amount), 'Pending', 'Pending']
    );
    const orderId = orderResult.insertId;

    // 2. Insert order items
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id || item.product_id, item.quantity, parseFloat(item.price)]
      );
    }

    // 3. Initiate payment with Razorpay or simulate if mock mode is on
    if (razorpay.isMockMode) {
      return res.status(201).json({
        message: 'Mock Order created successfully',
        orderId,
        totalAmount: total_amount,
        mock: true,
        razorpayOrderId: `mock_order_${orderId}_${Date.now()}`
      });
    } else {
      const options = {
        amount: Math.round(total_amount * 100), // Razorpay accepts in paise
        currency: 'INR',
        receipt: `receipt_order_${orderId}`
      };

      const rpOrder = await razorpay.razorpayInstance.orders.create(options);
      
      // Update order with payment details if needed, but returning it is fine
      return res.status(201).json({
        message: 'Order created successfully',
        orderId,
        totalAmount: total_amount,
        mock: false,
        razorpayOrderId: rpOrder.id,
        keyId: razorpay.keyId
      });
    }
  } catch (err) {
    console.error('[Create Order Error]:', err.message);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

const verifyPayment = async (req, res) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature, status } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {
    let isValid = false;

    if (razorpay.isMockMode) {
      // For mock payments, we accept simulated payment details or status
      isValid = status === 'success' || !!razorpayPaymentId;
    } else {
      // Standard Razorpay signature verification
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      isValid = expectedSignature === razorpaySignature;
    }

    if (!isValid) {
      // Mark payment as Failed
      await db.query('UPDATE orders SET payment_status = ? WHERE id = ?', ['Failed', orderId]);
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Payment Successful: Update order
    await db.query(
      'UPDATE orders SET payment_status = ?, status = ? WHERE id = ?',
      ['Paid', 'Confirmed', orderId]
    );

    // Fetch order items to update stock
    const [items] = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
    for (const item of items) {
      await db.query(
        'UPDATE products SET stock = CASE WHEN stock >= ? THEN stock - ? ELSE 0 END WHERE id = ?',
        [item.quantity, item.quantity, item.product_id]
      );
    }

    res.status(200).json({ message: 'Payment verified and order confirmed' });
  } catch (err) {
    console.error('[Verify Payment Error]:', err.message);
    res.status(500).json({ message: 'Server error verifying payment' });
  }
};

const getOrders = async (req, res) => {
  const { role, id } = req.user;

  try {
    let ordersList = [];

    if (role === 'customer') {
      const [orders] = await db.query(
        'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
        [id]
      );
      
      for (const order of orders) {
        const [items] = await db.query(`
          SELECT oi.*, p.name as product_name, p.image as product_image
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [order.id]);
        order.items = items;
      }
      ordersList = orders;
    } 
    else if (role === 'artisan') {
      // Find artisan ID first
      const [artisans] = await db.query('SELECT id FROM artisans WHERE user_id = ?', [id]);
      if (artisans.length === 0) {
        return res.status(403).json({ message: 'Artisan profile not found' });
      }
      const artisanId = artisans[0].id;

      // Get orders that contain items belonging to this artisan
      const [orders] = await db.query(`
        SELECT DISTINCT o.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        JOIN users u ON o.customer_id = u.id
        WHERE p.artisan_id = ?
        ORDER BY o.created_at DESC
      `, [artisanId]);

      for (const order of orders) {
        // Only return the items that belong to this artisan
        const [items] = await db.query(`
          SELECT oi.*, p.name as product_name, p.image as product_image
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ? AND p.artisan_id = ?
        `, [order.id, artisanId]);
        order.items = items;
      }
      ordersList = orders;
    } 
    else if (role === 'admin') {
      const [orders] = await db.query(`
        SELECT o.*, u.name as customer_name, u.email as customer_email
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        ORDER BY o.created_at DESC
      `);

      for (const order of orders) {
        const [items] = await db.query(`
          SELECT oi.*, p.name as product_name, p.image as product_image, u.name as artisan_name
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN artisans a ON p.artisan_id = a.id
          JOIN users u ON a.user_id = u.id
          WHERE oi.order_id = ?
        `, [order.id]);
        order.items = items;
      }
      ordersList = orders;
    }

    res.status(200).json(ordersList);
  } catch (err) {
    console.error('[Get Orders Error]:', err.message);
    res.status(500).json({ message: 'Server error retrieving orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Pending, Confirmed, Shipped, Delivered

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    // Check if order exists
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Role checks: Admin can update anything. Artisan can update if order contains their products.
    if (req.user.role !== 'admin') {
      const [artisans] = await db.query('SELECT id FROM artisans WHERE user_id = ?', [req.user.id]);
      if (artisans.length === 0) {
        return res.status(403).json({ message: 'Access denied.' });
      }
      const artisanId = artisans[0].id;

      const [items] = await db.query(`
        SELECT oi.id FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? AND p.artisan_id = ?
      `, [id, artisanId]);

      if (items.length === 0) {
        return res.status(403).json({ message: 'Access denied. This order does not contain your products.' });
      }
    }

    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.status(200).json({ message: `Order status updated to ${status}` });
  } catch (err) {
    console.error('[Update Order Status Error]:', err.message);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

const getArtisanEarnings = async (req, res) => {
  const userId = req.user.id;

  try {
    const [artisans] = await db.query('SELECT id FROM artisans WHERE user_id = ?', [userId]);
    if (artisans.length === 0) {
      return res.status(403).json({ message: 'Artisan profile not found' });
    }
    const artisanId = artisans[0].id;

    // Fetch all paid order items for this artisan's products
    const [sales] = await db.query(`
      SELECT oi.price, oi.quantity, o.created_at
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.artisan_id = ? AND o.payment_status = 'Paid'
    `, [artisanId]);

    let totalEarnings = 0;
    let totalItemsSold = 0;
    const monthlyData = {};

    sales.forEach(sale => {
      const amount = parseFloat(sale.price) * parseInt(sale.quantity);
      totalEarnings += amount;
      totalItemsSold += parseInt(sale.quantity);

      // Extract month (YYYY-MM)
      const date = new Date(sale.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + amount;
    });

    const monthlyBreakdown = Object.keys(monthlyData).map(month => ({
      month,
      earnings: monthlyData[month]
    })).sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({
      totalEarnings,
      totalItemsSold,
      monthlyBreakdown
    });
  } catch (err) {
    console.error('[Get Artisan Earnings Error]:', err.message);
    res.status(500).json({ message: 'Server error retrieving earnings' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const [usersCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const [artisansCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'artisan'");
    const [productsCount] = await db.query("SELECT COUNT(*) as count FROM products");
    const [ordersCount] = await db.query("SELECT COUNT(*) as count FROM orders");
    
    // Revenue from paid orders
    const [revenueResult] = await db.query("SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'Paid'");
    const totalRevenue = revenueResult[0].total || 0;

    // Fetch users for user management table
    const [usersList] = await db.query("SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC");

    res.status(200).json({
      stats: {
        totalCustomers: usersCount[0].count,
        totalArtisans: artisansCount[0].count,
        totalProducts: productsCount[0].count,
        totalOrders: ordersCount[0].count,
        totalRevenue: parseFloat(totalRevenue)
      },
      users: usersList
    });
  } catch (err) {
    console.error('[Get Admin Stats Error]:', err.message);
    res.status(500).json({ message: 'Server error retrieving admin statistics' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getOrders,
  updateOrderStatus,
  getArtisanEarnings,
  getAdminStats
};
