import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CustomerDashboard = () => {
  const { user, token, API_URL } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching customer orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user, navigate, API_URL, token]);

  const renderOrderTracker = (status) => {
    const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
    const currentIndex = statuses.indexOf(status);

    return (
      <div className="timeline-wrapper">
        <div className="timeline">
          {statuses.map((step, idx) => {
            let stepClass = '';
            if (idx < currentIndex) stepClass = 'completed';
            else if (idx === currentIndex) stepClass = 'active';

            return (
              <div key={idx} className={`timeline-step ${stepClass}`}>
                <div className="timeline-node"></div>
                <span className="timeline-label">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert('Product added to cart!');
  };

  return (
    <div className="main-content container" style={{ marginTop: '40px' }}>
      <h1 className="section-title" style={{ textAlign: 'left' }}>Patron Dashboard</h1>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <ul className="sidebar-menu">
            <li 
              className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 My Orders
            </li>
            <li 
              className={`sidebar-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              ❤️ Wishlist
            </li>
            <li 
              className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile Management
            </li>
          </ul>
        </aside>

        {/* Dashboard Panels */}
        <main className="dashboard-content">
          {activeTab === 'orders' && (
            <div>
              <h2 className="dashboard-section-title">Order History & Tracking</h2>
              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
                  <Link to="/products" className="btn btn-primary btn-sm" style={{ marginTop: '15px' }}>Start Shopping</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {orders.map((order) => (
                    <div key={order.id} className="review-card" style={{ borderLeftColor: 'var(--secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '15px', color: 'var(--secondary)' }}>
                        <span>Order #{order.id}</span>
                        <span>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        Date: {new Date(order.created_at).toLocaleDateString()} | Payment: <span className="status-pill status-paid">{order.payment_status}</span>
                      </div>

                      {/* Items details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {order.items && order.items.map((item) => (
                          <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <img src={item.product_image} alt={item.product_name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                            <div style={{ flexGrow: 1, fontSize: '14px' }}>
                              {item.product_name} <span style={{ color: 'var(--text-muted)' }}>x {item.quantity}</span>
                            </div>
                            <span style={{ fontWeight: '500', fontSize: '14px' }}>₹{parseFloat(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Timeline Tracker */}
                      {renderOrderTracker(order.status)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="dashboard-section-title">My Favourites</h2>
              {wishlist.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>Your wishlist is empty.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {wishlist.map((product) => (
                    <div key={product.id} className="review-card" style={{ display: 'flex', gap: '20px', alignItems: 'center', borderLeftColor: 'var(--accent)' }}>
                      <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flexGrow: 1 }}>
                        <h3 style={{ fontSize: '18px', color: 'var(--secondary)' }}>{product.name}</h3>
                        <span style={{ fontWeight: 'bold' }}>₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {product.stock > 0 ? (
                          <button onClick={() => handleAddToCart(product)} className="btn btn-primary btn-sm">
                            Add to Cart
                          </button>
                        ) : (
                          <span style={{ color: 'red', fontWeight: 'bold', fontSize: '13px', alignSelf: 'center', padding: '0 10px' }}>Out of Stock</span>
                        )}
                        <button onClick={() => toggleWishlist(product)} className="btn btn-outline btn-sm" style={{ color: 'red', borderColor: 'red' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="dashboard-section-title">Profile Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
                <div>
                  <strong>Full Name:</strong>
                  <p style={{ fontSize: '16px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'var(--bg-cream)', marginTop: '5px' }}>{user.name}</p>
                </div>
                <div>
                  <strong>Email Address:</strong>
                  <p style={{ fontSize: '16px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'var(--bg-cream)', marginTop: '5px' }}>{user.email}</p>
                </div>
                <div>
                  <strong>Mobile Number:</strong>
                  <p style={{ fontSize: '16px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'var(--bg-cream)', marginTop: '5px' }}>{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <strong>Account Type:</strong>
                  <p style={{ fontSize: '16px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'var(--bg-cream)', marginTop: '5px', textTransform: 'capitalize' }}>{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;
