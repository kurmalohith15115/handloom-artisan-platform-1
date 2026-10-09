import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations/translate';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user, token, API_URL } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [successPage, setSuccessPage] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      alert('Please log in to place orders.');
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      alert('Only customer accounts can place orders.');
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total_amount: cartTotal
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate order');
      }

      setActiveOrderId(data.orderId);

      if (data.mock) {
        // Trigger simulated payment sandbox modal
        setShowMockModal(true);
      } else {
        // Real Razorpay SDK integration
        const options = {
          key: data.keyId,
          amount: Math.round(cartTotal * 100),
          currency: 'INR',
          name: 'Handloom Artisan Platform',
          description: 'Direct Handloom Purchase',
          order_id: data.razorpayOrderId,
          handler: async function (response) {
            // Send to verification route
            const verifyRes = await fetch(`${API_URL}/orders/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            if (verifyRes.ok) {
              clearCart();
              setSuccessPage(true);
            } else {
              alert('Payment verification failed');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || ''
          },
          theme: {
            color: '#A24823'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      alert(err.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleMockPayment = async (status) => {
    setShowMockModal(false);
    setCheckoutLoading(true);

    try {
      const response = await fetch(`${API_URL}/orders/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: activeOrderId,
          status: status, // success or failure
          razorpayPaymentId: `mock_pay_${Date.now()}`
        })
      });

      if (response.ok) {
        clearCart();
        setSuccessPage(true);
      } else {
        alert('Mock payment failed to register.');
      }
    } catch (err) {
      console.error(err);
      alert('Error verifying mock transaction.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (successPage) {
    return (
      <div className="main-content container" style={{ marginTop: '80px', textAlign: 'center' }}>
        <div className="review-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', borderLeftColor: 'var(--success)' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h1 style={{ color: 'var(--success)', marginBottom: '15px' }}>Payment Successful!</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '30px' }}>
            Thank you for supporting our local handloom weavers. Your order has been registered, and the artisan will confirm shipment details shortly.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/customer-dashboard" className="btn btn-primary">Go to Dashboard</Link>
            <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content container" style={{ marginTop: '40px' }}>
      <h1 className="section-title">{t('cart.title')}</h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🧺</div>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '30px' }}>{t('cart.empty')}</p>
          <Link to="/products" className="btn btn-primary">Browse Handlooms</Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Left: Items list */}
          <div className="cart-items-box">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-row">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <span className="cart-item-artisan">By: {item.artisan_name}</span>
                </div>

                <div className="qty-counter">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)} className="qty-btn">-</button>
                  <div className="qty-number">{item.quantity}</div>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)} className="qty-btn">+</button>
                </div>

                <div style={{ width: '120px', textAlign: 'right', fontWeight: 'bold' }}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="btn btn-outline btn-sm"
                  style={{ color: 'red', borderColor: 'red' }}
                >
                  {t('cart.remove')}
                </button>
              </div>
            ))}
          </div>

          {/* Right: Summary details */}
          <div className="cart-summary-box">
            <h3 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>Order Summary</h3>
            
            <div className="summary-row">
              <span>Items Total:</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="summary-row">
              <span>Direct Shipping:</span>
              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>FREE</span>
            </div>

            <div className="summary-row summary-total">
              <span>{t('cart.total')}</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>

            <button 
              onClick={handleCheckout} 
              disabled={checkoutLoading} 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '30px' }}
            >
              {checkoutLoading ? 'Processing...' : t('cart.checkout')}
            </button>
          </div>
        </div>
      )}

      {/* Simulated Razorpay Overlay Modal */}
      {showMockModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--white)',
            padding: '30px',
            borderRadius: 'var(--border-radius)',
            maxWidth: '450px',
            width: '90%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-hover)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '15px' }}>R</div>
              <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#002C54' }}>razorpay <span style={{ color: '#2B84ED', fontSize: '12px', verticalAlign: 'super' }}>Sandbox</span></span>
            </div>
            
            <h3 style={{ color: 'var(--secondary)', marginBottom: '10px' }}>Simulated Payment Checkout</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              No real bank credentials required. Test the direct ordering loop by selecting an outcome below.
            </p>

            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '30px' }}>
              ₹{cartTotal.toLocaleString('en-IN')}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button 
                onClick={() => handleMockPayment('success')} 
                className="btn btn-primary"
                style={{ background: '#2C6E49', boxShadow: 'none' }}
              >
                ✅ Simulate Success (Authorise Payment)
              </button>
              
              <button 
                onClick={() => handleMockPayment('failed')} 
                className="btn btn-outline"
                style={{ borderColor: 'red', color: 'red' }}
              >
                ❌ Simulate Failure (Decline Payment)
              </button>

              <button 
                onClick={() => setShowMockModal(false)} 
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '10px' }}
              >
                Cancel Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
