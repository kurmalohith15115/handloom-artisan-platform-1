import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../translations/translate';

const ProductCard = ({ product }) => {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { t } = useLanguage();

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const handleAddToCart = (e) => {
    e.preventDefault(); // prevent navigation to product detail
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="product-card-image-container">
          <img 
            src={product.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'} 
            alt={product.name} 
            className="product-card-image"
          />
          <button 
            onClick={handleWishlistToggle} 
            className="product-wishlist-btn"
            title="Add to Wishlist"
            type="button"
          >
            {isWishlisted ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="product-card-content">
          <span className="product-card-category">{product.category}</span>
          <h3 className="product-card-title">{product.name}</h3>
          
          <div className="product-card-artisan">
            By: <span style={{ fontWeight: '500', color: 'var(--secondary)' }}>{product.artisan_name}</span>
          </div>

          <div className="product-card-price-row">
            <span className="product-card-price">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
            
            {product.stock > 0 ? (
              <button 
                onClick={handleAddToCart} 
                className="btn btn-primary btn-sm"
                type="button"
              >
                {t('products.addToCart')}
              </button>
            ) : (
              <span style={{ color: 'red', fontWeight: 'bold', fontSize: '13px' }}>
                {t('products.outOfStock')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
