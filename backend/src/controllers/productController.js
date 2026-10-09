const db = require('../config/db');

const getProducts = async (req, res) => {
  const { category, search, minPrice, maxPrice } = req.query;
  
  let sql = `
    SELECT p.*, a.craft_type, u.name as artisan_name 
    FROM products p
    JOIN artisans a ON p.artisan_id = a.id
    JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    sql += ' AND p.category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (minPrice) {
    sql += ' AND p.price >= ?';
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    sql += ' AND p.price <= ?';
    params.push(parseFloat(maxPrice));
  }

  sql += ' ORDER BY p.created_at DESC';

  try {
    const [products] = await db.query(sql, params);
    res.status(200).json(products);
  } catch (err) {
    console.error('[Get Products Error]:', err.message);
    res.status(500).json({ message: 'Server error retrieving products' });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const [products] = await db.query(`
      SELECT p.*, a.craft_type, a.experience, a.description as artisan_description, a.profile_image as artisan_image, u.name as artisan_name, u.email as artisan_email
      FROM products p
      JOIN artisans a ON p.artisan_id = a.id
      JOIN users u ON a.user_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = products[0];

    // Fetch reviews for this product
    const [reviews] = await db.query(`
      SELECT r.*, u.name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `, [id]);

    product.reviews = reviews;

    res.status(200).json(product);
  } catch (err) {
    console.error('[Get Product BY ID Error]:', err.message);
    res.status(500).json({ message: 'Server error retrieving product' });
  }
};

const createProduct = async (req, res) => {
  const { name, description, price, stock, image, category } = req.body;
  
  if (!name || !price || stock === undefined || !category) {
    return res.status(400).json({ message: 'Name, price, stock, and category are required' });
  }

  try {
    // Get artisan_id for logged in artisan user
    const [artisans] = await db.query('SELECT id FROM artisans WHERE user_id = ?', [req.user.id]);
    if (artisans.length === 0) {
      return res.status(403).json({ message: 'User is not registered as an artisan' });
    }
    const artisanId = artisans[0].id;

    const [result] = await db.query(
      'INSERT INTO products (artisan_id, name, description, price, stock, image, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        artisanId,
        name,
        description || '',
        parseFloat(price),
        parseInt(stock),
        image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
        category
      ]
    );

    res.status(201).json({ message: 'Product created successfully', productId: result.insertId });
  } catch (err) {
    console.error('[Create Product Error]:', err.message);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, image, category } = req.body;

  try {
    // Check product ownership
    const [products] = await db.query('SELECT artisan_id FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [artisans] = await db.query('SELECT id FROM artisans WHERE user_id = ?', [req.user.id]);
    if (artisans.length === 0 || artisans[0].id !== products[0].artisan_id) {
      return res.status(403).json({ message: 'Access denied. You do not own this product.' });
    }

    await db.query(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image = ?, category = ? WHERE id = ?',
      [
        name,
        description || '',
        parseFloat(price),
        parseInt(stock),
        image,
        category,
        id
      ]
    );

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('[Update Product Error]:', err.message);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [products] = await db.query('SELECT artisan_id FROM products WHERE id = ?', [id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Admins can delete any product; artisans can only delete their own
    if (req.user.role !== 'admin') {
      const [artisans] = await db.query('SELECT id FROM artisans WHERE user_id = ?', [req.user.id]);
      if (artisans.length === 0 || artisans[0].id !== products[0].artisan_id) {
        return res.status(403).json({ message: 'Access denied. You cannot delete this product.' });
      }
    }

    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('[Delete Product Error]:', err.message);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
