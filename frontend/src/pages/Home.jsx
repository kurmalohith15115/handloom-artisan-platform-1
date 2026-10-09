import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations/translate';
import ProductCard from '../components/ProductCard';
import ArtisanCard from '../components/ArtisanCard';

const Home = () => {
  const { API_URL } = useAuth();
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          // Extract first 3 products for featured products
          setFeaturedProducts(data.slice(0, 3));

          // Group products by artisan to extract unique artisan profiles
          const uniqueArtisans = [];
          const seen = new Set();
          
          data.forEach(product => {
            if (!seen.has(product.artisan_id)) {
              seen.add(product.artisan_id);
              uniqueArtisans.push({
                id: product.artisan_id,
                name: product.artisan_name,
                craft_type: product.craft_type,
                experience: product.experience || 15,
                profile_image: product.artisan_image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
                description: product.artisan_description || 'Master handloom weaver dedicated to preserving traditional Indian heritage.'
              });
            }
          });
          setArtisans(uniqueArtisans.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [API_URL]);

  const categories = [
    { name: 'Sarees', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600' },
    { name: 'Dupattas', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600' },
    { name: 'Dress Materials', image: 'https://images.unsplash.com/photo-1524282745852-a463843513c5?w=600' }
  ];

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1 className="hero-title">
              {t('home.heroTitle').split(' ').slice(0, -3).join(' ')} <span>{t('home.heroTitle').split(' ').slice(-3).join(' ')}</span>
            </h1>
            <p className="hero-subtitle">{t('home.heroSubtitle')}</p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">{t('home.shopNow')}</Link>
              <Link to="/register-artisan" className="btn btn-outline">{t('home.artisanRegister')}</Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-image-card">
              <img 
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800" 
                alt="Indian Handloom Weaving" 
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container" style={{ marginTop: '80px' }}>
        <h2 className="section-title">{t('home.featuredCategories')}</h2>
        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <Link to={`/products?category=${cat.name}`} key={idx} className="category-card">
              <img src={cat.image} alt={cat.name} />
              <div className="category-overlay">
                <h3 className="category-name">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container" style={{ marginTop: '80px' }}>
        <h2 className="section-title">{t('home.featuredProducts')}</h2>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading featured products...</p>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Artisans */}
      <section className="container" style={{ marginTop: '80px' }}>
        <h2 className="section-title">{t('home.featuredArtisans')}</h2>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading artisans...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {artisans.map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} />
            ))}
          </div>
        )}
      </section>

      {/* Community Impact Section */}
      <section className="container" style={{ marginTop: '100px' }}>
        <h2 className="section-title">{t('home.impactTitle')}</h2>
        <div className="impact-container">
          <div className="impact-badge-grid">
            <div className="impact-badge-card">
              <div className="impact-badge-value">+45%</div>
              <div className="impact-badge-label">{t('home.impactEarnings')}</div>
            </div>
            <div className="impact-badge-card">
              <div className="impact-badge-value">12+</div>
              <div className="impact-badge-label">{t('home.impactCrafts')}</div>
            </div>
            <div className="impact-badge-card">
              <div className="impact-badge-value">100%</div>
              <div className="impact-badge-label">{t('home.impactEmpower')}</div>
            </div>
            <div className="impact-badge-card">
              <div className="impact-badge-value">500+</div>
              <div className="impact-badge-label">{t('home.impactJobs')}</div>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '24px', color: 'var(--secondary)', marginBottom: '20px' }}>{t('home.successStories')}</h3>
            <div className="success-story-card">
              <h4 style={{ color: 'var(--primary)', marginBottom: '5px' }}>Srinivas Rao (Pochampally Ikat Weaver)</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                "By selling my sarees directly on this platform, my household income increased by 45%. I no longer have to depend on middlemen who take huge margins. I can pay my helpers on time."
              </p>
            </div>
            <div className="success-story-card">
              <h4 style={{ color: 'var(--primary)', marginBottom: '5px' }}>Kamlesh Devi (Banarasi Brocade Expert)</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                "Weaving sarees with silver zari is expensive. Direct sales have given me the capital to purchase pure silk yarns in bulk. I have hired 3 young weavers to help expand our collection."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container" style={{ marginTop: '80px' }}>
        <h2 className="section-title">{t('home.testimonials')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <div className="review-card" style={{ borderLeftColor: 'var(--accent)' }}>
            <p style={{ fontStyle: 'italic', marginBottom: '15px' }}>
              "The Pochampally saree I bought was stunning. The colors are so bright, and the silk feels heavy and authentic. Buying directly from the artisan makes it special."
            </p>
            <div style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>— Anjali Sharma (Bengaluru)</div>
          </div>
          <div className="review-card" style={{ borderLeftColor: 'var(--accent)' }}>
            <p style={{ fontStyle: 'italic', marginBottom: '15px' }}>
              "I love how this site supports local artisans. The detail page includes the experience of the weavers. Incredible transparency and beautiful sarees."
            </p>
            <div style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>— Devendra Singh (New Delhi)</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
