import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations/translate';

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      
      // Store email in local storage if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem('handloom_remember_email', email);
      } else {
        localStorage.removeItem('handloom_remember_email');
      }

      // Redirect depending on user role
      if (loggedUser.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (loggedUser.role === 'artisan') {
        navigate('/artisan-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('handloom_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="main-content">
      <div className="form-card">
        <h1 className="form-title">{t('auth.signIn')}</h1>

        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <label htmlFor="remember" style={{ margin: 0, cursor: 'pointer' }}>{t('auth.rememberMe')}</label>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Logging in...' : t('auth.signIn')}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          <p>
            {t('auth.noAccount')}{' '}
            <Link to="/register-customer" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
              {t('auth.registerHere')}
            </Link>
          </p>
          <p style={{ marginTop: '10px' }}>
            <Link to="/register-artisan" style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>
              {t('auth.artisanRegisterPrompt')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
