import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../translations/translate';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 className="footer-logo">Handloom Platform</h3>
            <p style={{ marginTop: '10px', fontSize: '14px', lineHeight: '1.7', opacity: '0.8' }}>
              Empowering local Indian artisans by providing a direct marketplace. Preserving generations of culture and craftsmanship, one loom at a time.
            </p>
          </div>
          
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">{t('nav.home')}</Link></li>
              <li><Link to="/products">{t('nav.products')}</Link></li>
              <li><Link to="/about">{t('nav.about')}</Link></li>
              <li><Link to="/contact">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Craft Regions</h4>
            <ul className="footer-links" style={{ opacity: '0.8' }}>
              <li>Pochampally (Telangana)</li>
              <li>Banaras (Uttar Pradesh)</li>
              <li>Kanchipuram (Tamil Nadu)</li>
              <li>Sambhalpur (Odisha)</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Info</h4>
            <ul className="footer-links" style={{ opacity: '0.8', fontSize: '14px' }}>
              <li>📍 2nd ward pedana, krishna dist</li>
              <li>✉️ lohith1223@gmail.com</li>
              <li>📞 +91 62814 25956</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Handloom Artisan Support Platform. All Rights Reserved. Built with traditional Indian heritage.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
