const db = require('../config/db');

const addReview = async (req, res) => {
  const { product_id, rating, review } = req.body;
  const customerId = req.user.id;

  if (!product_id || !rating) {
    return res.status(400).json({ message: 'Product ID and rating are required' });
  }

  const ratingInt = parseInt(rating);
  if (ratingInt < 1 || ratingInt > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    // Check if product exists
    const [products] = await db.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Insert review
    await db.query(
      'INSERT INTO reviews (product_id, customer_id, rating, review) VALUES (?, ?, ?, ?)',
      [product_id, customerId, ratingInt, review || '']
    );

    res.status(201).json({ message: 'Review added successfully' });
  } catch (err) {
    console.error('[Add Review Error]:', err.message);
    res.status(500).json({ message: 'Server error adding review' });
  }
};

const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const [reviews] = await db.query(`
      SELECT r.*, u.name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `, [productId]);

    res.status(200).json(reviews);
  } catch (err) {
    console.error('[Get Reviews Error]:', err.message);
    res.status(500).json({ message: 'Server error retrieving reviews' });
  }
};

const deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    const [reviews] = await db.query('SELECT customer_id FROM reviews WHERE id = ?', [id]);
    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Admin can delete any review. Customers can only delete their own.
    if (req.user.role !== 'admin' && req.user.id !== reviews[0].customer_id) {
      return res.status(403).json({ message: 'Access denied. You cannot delete this review.' });
    }

    await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('[Delete Review Error]:', err.message);
    res.status(500).json({ message: 'Server error deleting review' });
  }
};

module.exports = {
  addReview,
  getReviewsByProduct,
  deleteReview
};
