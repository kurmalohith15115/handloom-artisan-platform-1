import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations/translate';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const { API_URL } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Read URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setCategory(catParam);
    }
  }, [location.search]);

  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);

      const response = await fetch(`${API_URL}/products?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [category]); // fetch automatically when category updates, others fetch on click or enter

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchFilteredProducts();
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    // Clear filter triggers direct query
    const fetchAll = async () => {
      setLoading(true);
      const res = await fetch(`${API_URL}/products`);
      if (res.ok) setProducts(await res.json());
      setLoading(false);
    };
    fetchAll();
  };

  return (
    <div className="main-content container" style={{ marginTop: '40px' }}>
      <h1 className="section-title">{t('products.title')}</h1>

      {/* Product Catalog Grid */}
      <main style={{ marginTop: '30px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading products...</p>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '18px' }}>{t('products.noProducts')}</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
