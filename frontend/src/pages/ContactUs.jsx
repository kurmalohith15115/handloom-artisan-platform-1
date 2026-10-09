import React, { useState } from 'react';

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="main-content container" style={{ marginTop: '50px' }}>
      <h1 className="section-title">Get In Touch</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginTop: '40px' }}>
        <div>
          <h2 style={{ color: 'var(--secondary)', marginBottom: '20px' }}>Contact Details</h2>
          <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>
            Are you an artisan looking to sell, or a customer with questions about an order? Feel free to contact our support team.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ fontSize: '16px' }}>📍 <strong>Office Address:</strong> 2nd ward pedana, krishna dist</div>
            <div style={{ fontSize: '16px' }}>✉️ <strong>Support Email:</strong> lohith1223@gmail.com</div>
            <div style={{ fontSize: '16px' }}>📞 <strong>Helpline Phone:</strong> +91 62814 25956 (Mon-Sat, 9AM - 6PM)</div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="review-form">
            <h3 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>Send Us a Message</h3>
            
            {submitted && (
              <p style={{ color: 'var(--success)', marginBottom: '15px', fontWeight: 'bold' }}>
                Thank you! Your message has been received. Our team will contact you shortly.
              </p>
            )}

            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea 
                rows="5" 
                value={form.message} 
                onChange={(e) => setForm({ ...form, message: e.target.value })} 
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
