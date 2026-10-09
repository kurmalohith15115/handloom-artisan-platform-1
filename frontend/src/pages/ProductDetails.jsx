import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../translations/translate';

const ProductDetails = () => {
  const { id } = useParams();
  const { API_URL, user, token } = useAuth();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  // Review form states
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id, API_URL]);

  const handleQtyChange = (val) => {
    const newVal = qty + val;
    if (newVal >= 1 && newVal <= product.stock) {
      setQty(newVal);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
    alert('Product added to cart!');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!user) {
      setReviewError('You must be logged in to submit a review.');
      return;
    }

    if (user.role !== 'customer') {
      setReviewError('Only customers can write reviews.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: parseInt(id),
          rating,
          review: reviewText
        })
      });

      const data = await response.json();
      if (response.ok) {
        setReviewSuccess('Review submitted successfully!');
        setReviewText('');
        setRating(5);
        fetchProduct(); // reload product and reviews
      } else {
        setReviewError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Review submit error:', err);
      setReviewError('Server error submitting review');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading product details...</p>;
  if (!product) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Product not found.</p>;

  return (
    <div className="main-content container" style={{ marginTop: '40px' }}>
      <div className="product-detail-grid">
        {/* Left: Product Image */}
        <div className="detail-image-wrapper">
          <img 
            src={product.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'} 
            alt={product.name} 
            className="detail-image"
          />
        </div>

        {/* Right: Info Column */}
        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="detail-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</div>
          
          <p className="detail-description">{product.description}</p>

          <div className="detail-stock-row">
            <span style={{ fontWeight: '600' }}>
              Availability: {product.stock > 0 ? (
                <span style={{ color: 'var(--success)' }}>{t('products.stock')} ({product.stock})</span>
              ) : (
                <span style={{ color: 'red' }}>{t('products.outOfStock')}</span>
              )}
            </span>
          </div>

          {product.stock > 0 && (
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
              <div className="qty-counter">
                <button onClick={() => handleQtyChange(-1)} className="qty-btn">-</button>
                <div className="qty-number">{qty}</div>
                <button onClick={() => handleQtyChange(1)} className="qty-btn">+</button>
              </div>

              <button onClick={handleAddToCart} className="btn btn-primary" style={{ flexGrow: 1 }}>
                🛒 {t('products.addToCart')}
              </button>
            </div>
          )}

          {/* Artisan Card block */}
          <div className="detail-artisan-profile">
            <img 
              src={product.artisan_image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'} 
              alt={product.artisan_name} 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--secondary)' }}>{t('details.artisanInfo')}</h3>
              <p style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '14px' }}>
                {product.artisan_name} ({product.craft_type})
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {t('details.experience')} {product.experience} Years of Craftsmanship
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Reviews Section */}
      <section className="reviews-section">
        <h2 className="section-title" style={{ textAlign: 'left', fontSize: '28px' }}>{t('details.reviews')}</h2>
        
        <div className="reviews-grid">
          {/* Reviews list */}
          <div>
            {product.reviews && product.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {product.reviews.map((rev) => (
                  <div key={rev.id} className="review-card">
                    <div className="review-header">
                      <span className="review-author">{rev.customer_name}</span>
                      <span className="review-stars">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-dark)' }}>{rev.review}</p>
                    <div className="review-date" style={{ marginTop: '10px' }}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>{t('details.noReviews')}</p>
            )}
          </div>

          {/* Review form */}
          <div>
            {user && user.role === 'customer' ? (
              <form onSubmit={handleReviewSubmit} className="review-form">
                <h3 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>{t('details.writeReview')}</h3>
                
                {reviewError && <p style={{ color: 'red', marginBottom: '10px' }}>{reviewError}</p>}
                {reviewSuccess && <p style={{ color: 'var(--success)', marginBottom: '10px' }}>{reviewSuccess}</p>}

                <div className="form-group">
                  <label>{t('details.rating')}</label>
                  <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Very Good)</option>
                    <option value="3">3 Stars (Good)</option>
                    <option value="2">2 Stars (Average)</option>
                    <option value="1">1 Star (Poor)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('details.comment')}</label>
                  <textarea 
                    rows="4" 
                    value={reviewText} 
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-secondary btn-sm">
                  {t('details.submit')}
                </button>
              </form>
            ) : (
              <div className="review-form" style={{ textAlign: 'center', padding: '30px' }}>
                <p style={{ color: 'var(--text-muted)' }}>Please sign in as a customer to review this product.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
