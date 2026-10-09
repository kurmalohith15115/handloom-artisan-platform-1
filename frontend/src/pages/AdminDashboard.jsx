import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, token, API_URL } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stats');
  
  // Dashboard states
  const [stats, setStats] = useState({ totalCustomers: 0, totalArtisans: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Loaders
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Admin stats & users
      const statsRes = await fetch(`${API_URL}/orders/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setUsers(statsData.users);
      }

      // 2. Fetch all products
      const prodRes = await fetch(`${API_URL}/products`);
      if (prodRes.ok) {
        setProducts(await prodRes.json());
      }

      // 3. Fetch all orders
      const orderRes = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (orderRes.ok) {
        setOrders(await orderRes.json());
      }

      // 4. Fetch reviews (moderation)
      // Since reviews are linked to products, we can map over all products and pull reviews, or write a quick loop.
      // To keep it simple and clean, let's assemble them from products! Each product details endpoint contains reviews.
      // Alternatively, let's display a unified list of reviews by fetching details for the seeded products.
      // Let's query reviews of each product and flatMap them. This will build a perfect moderation list!
      const allReviews = [];
      const loadedProducts = await (await fetch(`${API_URL}/products`)).json();
      for (const prod of loadedProducts) {
        const detailRes = await fetch(`${API_URL}/products/${prod.id}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          if (detail.reviews) {
            detail.reviews.forEach(rev => {
              allReviews.push({
                ...rev,
                productName: prod.name,
                productId: prod.id
              });
            });
          }
        }
      }
      setReviews(allReviews);

    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [user, navigate, API_URL, token]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product from the platform?')) return;
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Product deleted');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Moderate and delete this review?')) return;
    try {
      const response = await fetch(`${API_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Review moderated and removed.');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="main-content container" style={{ marginTop: '40px' }}>
      <h1 className="section-title" style={{ textAlign: 'left' }}>Admin Moderation Console</h1>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <ul className="sidebar-menu">
            <li 
              className={`sidebar-item ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              📊 Platform Overview
            </li>
            <li 
              className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 User Accounts
            </li>
            <li 
              className={`sidebar-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              🧶 Products Moderation
            </li>
            <li 
              className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Order Records
            </li>
            <li 
              className={`sidebar-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              ⭐ Review Moderation
            </li>
          </ul>
        </aside>

        {/* Contents Panels */}
        <main className="dashboard-content">
          {loading ? (
            <p>Loading admin stats...</p>
          ) : (
            <>
              {activeTab === 'stats' && (
                <div>
                  <h2 className="dashboard-section-title">System Statistics</h2>
                  
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{stats.totalCustomers}</div>
                      <div className="stat-label">Customers</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{stats.totalArtisans}</div>
                      <div className="stat-label">Artisans</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{stats.totalProducts}</div>
                      <div className="stat-label">Products</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{stats.totalOrders}</div>
                      <div className="stat-label">Total Orders</div>
                    </div>
                  </div>

                  <div className="stat-card" style={{ maxWidth: '400px', margin: '0 auto', background: 'var(--primary)' }}>
                    <div className="stat-value">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
                    <div className="stat-label">Total GTV Revenue</div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h2 className="dashboard-section-title">Registered Accounts</h2>
                  <div className="table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Phone</th>
                          <th>Joined Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td>{u.id}</td>
                            <td><strong>{u.name}</strong></td>
                            <td>{u.email}</td>
                            <td>
                              <span className="status-pill status-paid" style={{ backgroundColor: u.role === 'artisan' ? 'rgba(229,152,52,0.15)' : 'rgba(44,110,73,0.15)' }}>
                                {u.role}
                              </span>
                            </td>
                            <td>{u.phone || '-'}</td>
                            <td>{new Date(u.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div>
                  <h2 className="dashboard-section-title">Product Catalog Control</h2>
                  <div className="table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Title</th>
                          <th>Weaver / Artisan</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id}>
                            <td><img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /></td>
                            <td><strong>{p.name}</strong></td>
                            <td>{p.artisan_name}</td>
                            <td>{p.category}</td>
                            <td>₹{parseFloat(p.price).toLocaleString('en-IN')}</td>
                            <td>
                              <button 
                                onClick={() => handleDeleteProduct(p.id)} 
                                className="btn btn-outline btn-sm"
                                style={{ color: 'red', borderColor: 'red' }}
                              >
                                Remove Product
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="dashboard-section-title">Platform Order History</h2>
                  <div className="table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Customer</th>
                          <th>Total Amount</th>
                          <th>Fulfillment</th>
                          <th>Payment Status</th>
                          <th>Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.id}>
                            <td>#{o.id}</td>
                            <td><strong>{o.customer_name}</strong><br />{o.customer_email}</td>
                            <td>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
                            <td>{o.status}</td>
                            <td><span className="status-pill status-paid">{o.payment_status}</span></td>
                            <td>{new Date(o.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h2 className="dashboard-section-title">Moderator Ratings list</h2>
                  {reviews.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No customer ratings listed on the platform.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {reviews.map((rev) => (
                        <div key={rev.id} className="review-card" style={{ borderLeftColor: 'var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '8px' }}>
                              <strong style={{ color: 'var(--secondary)' }}>{rev.customer_name}</strong>
                              <span style={{ color: 'var(--accent)' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '5px' }}>
                              On Product: <strong>{rev.productName}</strong>
                            </p>
                            <p style={{ fontSize: '14px' }}>"{rev.review}"</p>
                          </div>
                          
                          <button 
                            onClick={() => handleDeleteReview(rev.id)} 
                            className="btn btn-outline btn-sm"
                            style={{ color: 'red', borderColor: 'red' }}
                          >
                            Delete Review
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
