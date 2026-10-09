import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ArtisanDashboard = () => {
  const { user, token, API_URL } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('inventory');
  
  // Lists states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState({ totalEarnings: 0, totalItemsSold: 0, monthlyBreakdown: [] });
  
  // Loaders
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Add Product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Sarees',
    image: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch Inventory
  const fetchInventory = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch(`${API_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        // Filter products belonging to this artisan
        const artisanProducts = data.filter(p => p.artisan_id === user.artisanId);
        setProducts(artisanProducts);
      }
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setOrders(await response.json());
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Earnings report
  const fetchEarnings = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/artisan/earnings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setEarnings(await response.json());
      }
    } catch (err) {
      console.error('Error loading earnings report:', err);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'artisan') {
      navigate('/login');
      return;
    }
    fetchInventory();
    fetchOrders();
    fetchEarnings();
  }, [user, navigate, API_URL, token]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });

      const data = await response.json();
      if (response.ok) {
        setFormSuccess('Product created successfully!');
        setNewProduct({ name: '', description: '', price: '', stock: '', category: 'Sarees', image: '' });
        fetchInventory(); // reload listing
        setActiveTab('inventory');
      } else {
        setFormError(data.message || 'Failed to create product');
      }
    } catch (err) {
      setFormError('Server error creating product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Product deleted successfully');
        fetchInventory();
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Status updated to: ${newStatus}`);
        fetchOrders();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="main-content container" style={{ marginTop: '40px' }}>
      <h1 className="section-title" style={{ textAlign: 'left' }}>Artisan Studio Dashboard</h1>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <ul className="sidebar-menu">
            <li 
              className={`sidebar-item ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              🧶 Inventory Management
            </li>
            <li 
              className={`sidebar-item ${activeTab === 'add-product' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-product')}
            >
              ➕ Add Product
            </li>
            <li 
              className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Order Shipments
            </li>
            <li 
              className={`sidebar-item ${activeTab === 'earnings' ? 'active' : ''}`}
              onClick={() => setActiveTab('earnings')}
            >
              📈 Earnings & Analytics
            </li>
            <li 
              className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Profile & Heritage
            </li>
          </ul>
        </aside>

        {/* Contents Area */}
        <main className="dashboard-content">
          {activeTab === 'inventory' && (
            <div>
              <h2 className="dashboard-section-title">My Handloom Products</h2>
              {loadingProducts ? (
                <p>Loading inventory...</p>
              ) : products.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>You haven't listed any products yet. Click 'Add Product' to start.</p>
              ) : (
                <div className="table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => (
                        <tr key={prod.id}>
                          <td>
                            <img src={prod.image} alt={prod.name} style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                          </td>
                          <td><strong style={{ color: 'var(--secondary)' }}>{prod.name}</strong></td>
                          <td>{prod.category}</td>
                          <td>₹{parseFloat(prod.price).toLocaleString('en-IN')}</td>
                          <td>{prod.stock > 0 ? prod.stock : <span style={{ color: 'red', fontWeight: 'bold' }}>Out of Stock</span>}</td>
                          <td>
                            <button 
                              onClick={() => handleDeleteProduct(prod.id)} 
                              className="btn btn-outline btn-sm"
                              style={{ color: 'red', borderColor: 'red' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'add-product' && (
            <div>
              <h2 className="dashboard-section-title">Upload New Handloom Product</h2>
              {formError && <p style={{ color: 'red', marginBottom: '15px' }}>{formError}</p>}
              {formSuccess && <p style={{ color: 'var(--success)', marginBottom: '15px' }}>{formSuccess}</p>}

              <form onSubmit={handleCreateProduct} style={{ maxWidth: '600px' }}>
                <div className="form-group">
                  <label>Product Title</label>
                  <input 
                    type="text" 
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
                    placeholder="e.g. Pure Mulberry Silk Kanjeevaram Saree"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Description (Describe weaving techniques, materials, dyes)</label>
                  <textarea 
                    rows="4" 
                    value={newProduct.description} 
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} 
                    placeholder="Woven with pure gold threads..."
                    required
                  ></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input 
                      type="number" 
                      value={newProduct.price} 
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock / Quantity</label>
                    <input 
                      type="number" 
                      value={newProduct.stock} 
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={newProduct.category} 
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    <option value="Sarees">Sarees</option>
                    <option value="Dupattas">Dupattas</option>
                    <option value="Dress Materials">Dress Materials</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Product Image URL</label>
                  <input 
                    type="url" 
                    value={newProduct.image} 
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} 
                    placeholder="Paste a direct image link"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Publish Product
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="dashboard-section-title">Incoming Customer Orders</h2>
              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : orders.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No customers have ordered your products yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  {orders.map((order) => (
                    <div key={order.id} className="review-card" style={{ borderLeftColor: 'var(--secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '15px' }}>
                        <span style={{ color: 'var(--secondary)' }}>Order #{order.id}</span>
                        <span>Fulfillment Status: {order.status}</span>
                      </div>

                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                        Customer: <strong>{order.customer_name}</strong> | Email: {order.customer_email} | Phone: {order.customer_phone}
                      </div>

                      {/* Items ordered from this artisan */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', borderBottom: '1px dashed #ddd', paddingBottom: '15px' }}>
                        {order.items && order.items.map((item) => (
                          <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <img src={item.product_image} alt={item.product_name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                            <div style={{ flexGrow: 1, fontSize: '14px' }}>
                              {item.product_name} <span style={{ color: 'var(--text-muted)' }}>x {item.quantity}</span>
                            </div>
                            <span style={{ fontWeight: '500' }}>₹{parseFloat(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>Update Status:</span>
                        <select 
                          value={order.status} 
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="filter-select"
                          style={{ width: '200px', margin: 0 }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'earnings' && (
            <div>
              <h2 className="dashboard-section-title">Earnings Summary</h2>
              
              {/* Stats Block */}
              <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                <div className="stat-card">
                  <div className="stat-value">₹{earnings.totalEarnings.toLocaleString('en-IN')}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{earnings.totalItemsSold}</div>
                  <div className="stat-label">Handloom Items Sold</div>
                </div>
              </div>

              <h3 style={{ color: 'var(--secondary)', marginBottom: '15px' }}>Sales Analytics</h3>
              {earnings.monthlyBreakdown && earnings.monthlyBreakdown.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No monthly sales records found.</p>
              ) : (
                <div className="table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Billing Month</th>
                        <th>Earnings (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.monthlyBreakdown.map((row, idx) => (
                        <tr key={idx}>
                          <td><strong>{row.month}</strong></td>
                          <td>₹{row.earnings.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="dashboard-section-title">Artisan Profile Info</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
                <div>
                  <strong>Weaver Name:</strong>
                  <p style={{ fontSize: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'var(--bg-cream)', marginTop: '5px' }}>{user.name}</p>
                </div>
                <div>
                  <strong>Craft Type:</strong>
                  <p style={{ fontSize: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'var(--bg-cream)', marginTop: '5px' }}>{user.artisanDetails?.craft_type}</p>
                </div>
                <div>
                  <strong>Years of Experience:</strong>
                  <p style={{ fontSize: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'var(--bg-cream)', marginTop: '5px' }}>{user.artisanDetails?.experience} Years</p>
                </div>
                <div>
                  <strong>Weaving Studio Address:</strong>
                  <p style={{ fontSize: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'var(--bg-cream)', marginTop: '5px' }}>{user.artisanDetails?.address}</p>
                </div>
                <div>
                  <strong>Legacy Description:</strong>
                  <p style={{ fontSize: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'var(--bg-cream)', marginTop: '5px', lineHeight: '1.6' }}>{user.artisanDetails?.description}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ArtisanDashboard;
