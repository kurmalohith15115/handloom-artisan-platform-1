import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations/translate';

const RegisterArtisan = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    craft_type: '',
    experience: '',
    description: '',
    profile_image: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        ...form,
        role: 'artisan'
      });
      alert('Artisan registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="form-card" style={{ maxWidth: '600px' }}>
        <h1 className="form-title">{t('auth.artisanSignUp')}</h1>

        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>{t('auth.email')}</label>
              <input 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input 
                type="tel" 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Weaving Workshop Address</label>
            <input 
              type="text" 
              value={form.address} 
              onChange={(e) => setForm({ ...form, address: e.target.value })} 
              placeholder="e.g. Pochampally Village, Telangana"
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
            <div className="form-group">
              <label>Craft Type</label>
              <input 
                type="text" 
                value={form.craft_type} 
                onChange={(e) => setForm({ ...form, craft_type: e.target.value })} 
                placeholder="e.g. Pochampally Ikat Weaving"
                required 
              />
            </div>
            <div className="form-group">
              <label>Loom Experience (Years)</label>
              <input 
                type="number" 
                value={form.experience} 
                onChange={(e) => setForm({ ...form, experience: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bio Description (About your craft heritage)</label>
            <textarea 
              rows="3" 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell customers about your weaving legacy..."
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Profile Image URL (Optional)</label>
            <input 
              type="url" 
              value={form.profile_image} 
              onChange={(e) => setForm({ ...form, profile_image: e.target.value })} 
              placeholder="Leave blank for default"
            />
          </div>

          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input 
              type="password" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              required 
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Submitting profile...' : 'Join as Artisan'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          <p>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterArtisan;
