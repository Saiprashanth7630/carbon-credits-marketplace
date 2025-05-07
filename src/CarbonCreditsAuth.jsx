import React, { useState } from 'react';

export default function CarbonCreditsAuth() {
  const [isLogin, setIsLogin] = useState(true);

  // Form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    organization: '',
    role: '',
    location: '',
    creditType: '',
    communication: '',
    agreeToTerms: false,
  });

  // Handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    alert(`Logging in with email: ${loginForm.email}`);
    // Add authentication logic here
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupForm.agreeToTerms) {
      alert('You must agree to the terms and conditions.');
      return;
    }
    alert(`Signing up user: ${signupForm.fullName}`);
    // Add signup logic here
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
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
              <button onClick={() => setIsLogin(false)} style={styles.linkButton}>
                Sign up
              </button>
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
                  placeholder="Your name"
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
              <label style={styles.label}>
                Preferred Communication Method
                <select
                  style={styles.input}
                  name="communication"
                  value={signupForm.communication}
                  onChange={handleSignupChange}
                >
                  <option value="" disabled>Select communication method</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="phone">Phone</option>
                </select>
              </label>
              <label style={{...styles.label, flexDirection: 'row', alignItems: 'center'}}>
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
              <button onClick={() => setIsLogin(true)} style={styles.linkButton}>
                Login
              </button>
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
    color: 'white',
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
  }
};
