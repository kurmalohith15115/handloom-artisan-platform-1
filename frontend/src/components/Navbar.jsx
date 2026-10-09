import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../translations/translate';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'artisan') return '/artisan-dashboard';
    return '/customer-dashboard';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo-container">
          <div className="logo-icon">H</div>
          <span className="logo-text">Handloom Platform</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/" className="nav-item">{t('nav.home')}</Link></li>
          <li><Link to="/products" className="nav-item">{t('nav.products')}</Link></li>
          <li><Link to="/about" className="nav-item">{t('nav.about')}</Link></li>
          <li><Link to="/contact" className="nav-item">{t('nav.contact')}</Link></li>
        </ul>

        <div className="nav-actions">
          {/* Language Switcher */}
          <select 
            className="lang-select" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
            <option value="hi">हिन्दी</option>
          </select>

          {/* Cart Icon */}
          <Link to="/cart" className="cart-icon-container">
            🛒 {t('nav.cart')}
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Auth Button */}
          {user ? (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Link to={getDashboardPath()} className="btn btn-secondary btn-sm">
                👤 {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              🔑 {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
