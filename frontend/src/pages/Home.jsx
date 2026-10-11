
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
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error(`Products API failed: ${response.status}`);
        }

        const result = await response.json();

        // Accept an array or common API response formats.
        const data = Array.isArray(result)
          ? result
          : Array.isArray(result?.products)
            ? result.products
            : Array.isArray(result?.data)
              ? result.data
              : null;

        if (!data) {
          console.error(
            'Unexpected products API response:',
            result
          );

          if (isMounted) {
            setFeaturedProducts([]);
            setArtisans([]);
          }

          return;
        }

        // Display the first three products.
        const products = data.slice(0, 3);

        // Extract unique artisans from the product list.
        const uniqueArtisans = [];
        const seen = new Set();

        data.forEach((product) => {
          const artisan = product.artisan || {};

          const artisanId =
            product.artisan_id ??
            artisan._id ??
            product.artisanId ??
            null;

          if (artisanId && !seen.has(String(artisanId))) {
            seen.add(String(artisanId));

            uniqueArtisans.push({
              id: artisanId,
              name:
                product.artisan_name ??
                artisan.name ??
                'Artisan',
              craft_type:
                product.craft_type ??
                artisan.craft_type ??
                '',
              experience:
                product.experience ??
                artisan.experience ??
                15,
              profile_image:
                product.artisan_image ??
                artisan.profile_image ??
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
              description:
                product.artisan_description ??
                artisan.description ??
                'Dedicated to preserving traditional Indian craft heritage.'
            });
          }
        });

        if (isMounted) {
          setFeaturedProducts(products);
          setArtisans(uniqueArtisans.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to load homepage data:', error);

        if (isMounted) {
          setFeaturedProducts([]);
          setArtisans([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  const categories = [
    {
      name: 'Sarees',
      image:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'
    },
    {
      name: 'Dupattas',
      image:
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600'
    },
    {
      name: 'Dress Materials',
      image:
        'https://images.unsplash.com/photo-1524282745852-a463843513c5?w=600'
    }
  ];

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1 className="hero-title">
              {t('home.heroTitle').split(' ').slice(0, -3).join(' ')}{' '}
              <span>
                {t('home.heroTitle').split(' ').slice(-3).join(' ')}
              </span>
            </h1>

            <p className="hero-subtitle">
              {t('home.heroSubtitle')}
            </p>

            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">
                {t('home.shopNow')}
              </Link>

              <Link
                to="/register-artisan"
                className="btn btn-outline"
              >
                {t('home.artisanRegister')}
              </Link>
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
      <section
        className="container"
        style={{ marginTop: '80px' }}
      >
        <h2 className="section-title">
          {t('home.featuredCategories')}
        </h2>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              to={`/products?category=${encodeURIComponent(category.name)}`}
              key={category.name}
              className="category-card"
            >
              <img src={category.image} alt={category.name} />

              <div className="category-overlay">
                <h3 className="category-name">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section
        className="container"
        style={{ marginTop: '80px' }}
      >
        <h2 className="section-title">
          {t('home.featuredProducts')}
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center' }}>
            Loading featured products...
          </p>
        ) : featuredProducts.length > 0 ? (
          <div className="product-grid">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={product._id ?? product.id ?? index}
                product={product}
              />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center' }}>
            No featured products available right now.
          </p>
        )}
      </section>

      {/* Featured Artisans */}
      <section
        className="container"
        style={{ marginTop: '80px' }}
      >
        <h2 className="section-title">
          {t('home.featuredArtisans')}
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center' }}>
            Loading artisans...
          </p>
        ) : artisans.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px'
            }}
          >
            {artisans.map((artisan) => (
              <ArtisanCard
                key={artisan.id}
                artisan={artisan}
              />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center' }}>
            Artisan profiles will appear here when available.
          </p>
        )}
      </section>

      {/* Community Impact Section */}
      <section
        className="container"
        style={{ marginTop: '100px' }}
      >
        <h2 className="section-title">
          {t('home.impactTitle')}
        </h2>

        <div className="impact-container">
          <div className="impact-badge-grid">
            <div className="impact-badge-card">
              <div className="impact-badge-value">+45%</div>
              <div className="impact-badge-label">
                {t('home.impactEarnings')}
              </div>
            </div>

            <div className="impact-badge-card">
              <div className="impact-badge-value">12+</div>
              <div className="impact-badge-label">
                {t('home.impactCrafts')}
              </div>
            </div>

            <div className="impact-badge-card">
              <div className="impact-badge-value">100%</div>
              <div className="impact-badge-label">
                {t('home.impactEmpower')}
              </div>
            </div>

            <div className="impact-badge-card">
              <div className="impact-badge-value">500+</div>
              <div className="impact-badge-label">
                {t('home.impactJobs')}
              </div>
            </div>
          </div>

          <div>
            <h3
              style={{
                fontSize: '24px',
                color: 'var(--secondary)',
                marginBottom: '20px'
              }}
            >
              {t('home.successStories')}
            </h3>

            <div className="success-story-card">
              <h4
                style={{
                  color: 'var(--primary)',
                  marginBottom: '5px'
                }}
              >
                Srinivas Rao (Pochampally Ikat Weaver)
              </h4>

              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)'
                }}
              >
                "By selling my sarees directly on this platform, my
                household income increased by 45%. I no longer have
                to depend on middlemen who take huge margins. I can
                pay my helpers on time."
              </p>
            </div>

            <div className="success-story-card">
              <h4
                style={{
                  color: 'var(--primary)',
                  marginBottom: '5px'
                }}
              >
                Kamlesh Devi (Banarasi Brocade Expert)
              </h4>

              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)'
                }}
              >
                "Weaving sarees with silver zari is expensive.
                Direct sales have given me the capital to purchase
                pure silk yarns in bulk. I have hired 3 young weavers
                to help expand our collection."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="container"
        style={{ marginTop: '80px' }}
      >
        <h2 className="section-title">
          {t('home.testimonials')}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px'
          }}
        >
          <div
            className="review-card"
            style={{ borderLeftColor: 'var(--accent)' }}
          >
            <p
              style={{
                fontStyle: 'italic',
                marginBottom: '15px'
              }}
            >
              "The Pochampally saree I bought was stunning. The
              colors are so bright, and the silk feels heavy and
              authentic. Buying directly from the artisan makes it
              special."
            </p>

            <div
              style={{
                fontWeight: 'bold',
                color: 'var(--secondary)'
              }}
            >
              — Anjali Sharma (Bengaluru)
            </div>
          </div>

          <div
            className="review-card"
            style={{ borderLeftColor: 'var(--accent)' }}
          >
            <p
              style={{
                fontStyle: 'italic',
                marginBottom: '15px'
              }}
            >
              "I love how this site supports local artisans. The
              detail page includes the experience of the weavers.
              Incredible transparency and beautiful sarees."
            </p>

            <div
              style={{
                fontWeight: 'bold',
                color: 'var(--secondary)'
              }}
            >
              — Devendra Singh (New Delhi)
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
