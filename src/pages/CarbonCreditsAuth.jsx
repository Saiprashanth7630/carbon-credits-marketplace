import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function CarbonCreditsAuth() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [isLogin, setIsLogin] = useState(mode === 'signin');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [mode]);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    fullName: '', email: '', password: '', organization: '', role: '', location: '', creditType: '', agreeToTerms: false
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/home');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!signupForm.agreeToTerms) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupForm),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/auth/signin');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {error && <div style={styles.error}>{error}</div>}
        
        {isLogin ? (
          <>
            <h2 style={styles.title}>Login to Carbon Credits Marketplace</h2>
            <form onSubmit={handleLoginSubmit} style={styles.form}>
              <label style={styles.label}>
                Email
                <input 
                  style={styles.input} 
                  type="email" 
                  name="email" 
                  value={loginForm.email} 
                  onChange={handleLoginChange} 
                  required 
                  placeholder="you@example.com" 
                />
              </label>
              <label style={styles.label}>
                Password
                <input 
                  style={styles.input} 
                  type="password" 
                  name="password" 
                  value={loginForm.password} 
                  onChange={handleLoginChange} 
                  required 
                  placeholder="Your password" 
                  minLength={6} 
                />
              </label>
              <button type="submit" style={styles.button}>Login</button>
            </form>
            <p style={styles.switchText}>
              Don't have an account?{' '}
              <button onClick={() => setIsLogin(false)} style={styles.linkButton}>Sign up</button>
            </p>
          </>
        ) : (
          <>
            <h2 style={styles.title}>Sign Up for Carbon Credits Marketplace</h2>
            <form onSubmit={handleSignupSubmit} style={styles.form}>
              <label style={styles.label}>
                Full Name
                <input 
                  style={styles.input} 
                  type="text" 
                  name="fullName" 
                  value={signupForm.fullName} 
                  onChange={handleSignupChange} 
                  required 
                  placeholder="John Doe" 
                />
              </label>
              <label style={styles.label}>
                Email
                <input 
                  style={styles.input} 
                  type="email" 
                  name="email" 
                  value={signupForm.email} 
                  onChange={handleSignupChange} 
                  required 
                  placeholder="you@example.com" 
                />
              </label>
              <label style={styles.label}>
                Password
                <input 
                  style={styles.input} 
                  type="password" 
                  name="password" 
                  value={signupForm.password} 
                  onChange={handleSignupChange} 
                  required 
                  minLength={6} 
                  placeholder="Create a password" 
                />
              </label>
              <label style={styles.label}>
                Organization Name
                <input 
                  style={styles.input} 
                  type="text" 
                  name="organization" 
                  value={signupForm.organization} 
                  onChange={handleSignupChange} 
                  placeholder="Your business or organization" 
                />
              </label>
              <label style={styles.label}>
                Role / Position
                <input 
                  style={styles.input} 
                  type="text" 
                  name="role" 
                  value={signupForm.role} 
                  onChange={handleSignupChange} 
                  placeholder="e.g. Buyer, Seller, Broker" 
                />
              </label>
              <label style={styles.label}>
                Location
                <input 
                  style={styles.input} 
                  type="text" 
                  name="location" 
                  value={signupForm.location} 
                  onChange={handleSignupChange} 
                  placeholder="City, Country" 
                />
              </label>
              <label style={styles.label}>
                Type of Carbon Credits Interested In
                <select 
                  style={styles.input} 
                  name="creditType" 
                  value={signupForm.creditType} 
                  onChange={handleSignupChange}
                >
                  <option value="" disabled>Select credit type</option>
                  <option value="renewable-energy">Renewable Energy</option>
                  <option value="forestry">Forestry</option>
                  <option value="energy-efficiency">Energy Efficiency</option>
                  <option value="methane-capture">Methane Capture</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label style={{...styles.label, flexDirection: 'row', alignItems: 'center'}}>
                <input 
                  type="checkbox" 
                  name="agreeToTerms" 
                  checked={signupForm.agreeToTerms} 
                  onChange={handleSignupChange} 
                  style={{marginRight: 8}} 
                />
                I agree to the{' '}
                <a href="/terms" target="_blank" rel="noreferrer" style={styles.link}>terms and conditions</a>
              </label>
              <button 
                type="submit" 
                style={{...styles.button, marginTop: 16}} 
                disabled={!signupForm.agreeToTerms}
              >
                Sign Up
              </button>
            </form>
            <p style={styles.switchText}>
              Already have an account?{' '}
              <button onClick={() => setIsLogin(true)} style={styles.linkButton}>Login</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
    maxWidth: 400,
    width: '100%',
    boxSizing: 'border-box',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#2e7d32',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: 16,
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: 14,
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    marginTop: 6,
    padding: '10px 12px',
    fontSize: 14,
    borderRadius: 6,
    border: '1.5px solid #a5d6a7',
    outline: 'none',
    transition: 'border-color 0.2s ease-in-out',
  },
  button: {
    marginTop: 12,
    padding: '12px',
    fontSize: 16,
    fontWeight: '700',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#2e7d32',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease-in-out',
  },
  switchText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#2e7d32',
    fontWeight: '600',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#2e7d32',
    cursor: 'pointer',
    fontWeight: '700',
    textDecoration: 'underline',
    padding: 0,
  },
  link: {
    color: '#2e7d32',
    textDecoration: 'underline',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '16px',
    textAlign: 'center',
  }
}; 