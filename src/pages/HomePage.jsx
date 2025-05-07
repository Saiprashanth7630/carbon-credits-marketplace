import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function HomePage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleBuyCredits = () => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    console.log('Buying credits...');
  };

  const handleSellCredits = () => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }
    console.log('Selling credits...');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <h1 style={{ margin: 0, color: '#2e7d32', fontSize: '1.5rem' }}>Carbon Credits Marketplace</h1>
          </div>
          <div style={styles.navLinks}>
            <a href="#about" style={styles.navLink}>About</a>
            <a href="#how-it-works" style={styles.navLink}>How It Works</a>
            <a href="#benefits" style={styles.navLink}>Benefits</a>
            {user ? (
              <div style={styles.userSection}>
                <div style={styles.userInfo}>
                  <div style={styles.avatar}>
                    {user?.fullName?.[0] || '?'}
                  </div>
                  <div>
                    <strong>{user?.fullName || 'User'}</strong>
                    <small style={{ display: 'block' }}>{user?.email || ''}</small>
                  </div>
                </div>
                <button onClick={handleLogout} style={styles.logoutButton}>
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/auth/signin')} style={styles.loginButton}>
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Trade Carbon Credits with Confidence</h1>
          <p style={styles.heroSubtitle}>
            Join the global movement to reduce carbon emissions and create a sustainable future
          </p>
          <div style={styles.ctaButtons}>
            <button onClick={handleBuyCredits} style={styles.primaryButton}>
              Buy Credits
            </button>
            <button onClick={handleSellCredits} style={styles.secondaryButton}>
              Sell Credits
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={styles.section}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>About Carbon Credits</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <h3>What are Carbon Credits?</h3>
              <p>Carbon credits are certificates representing one ton of carbon dioxide or equivalent greenhouse gases that have been prevented from entering the atmosphere.</p>
            </div>
            <div style={styles.infoCard}>
              <h3>Why Trade Carbon Credits?</h3>
              <p>Trading carbon credits helps organizations meet their emission reduction targets while supporting sustainable projects worldwide.</p>
            </div>
            <div style={styles.infoCard}>
              <h3>Market Impact</h3>
              <p>The carbon credit market is growing rapidly, with increasing participation from businesses committed to sustainability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={styles.section}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <div style={styles.stepsContainer}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <h3>Create Account</h3>
              <p>Sign up and verify your account to start trading carbon credits.</p>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <h3>Choose Credits</h3>
              <p>Browse and select from various carbon credit projects.</p>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <h3>Trade</h3>
              <p>Buy or sell credits through our secure platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" style={styles.section}>
        <div style={styles.sectionContent}>
          <h2 style={styles.sectionTitle}>Benefits</h2>
          <div style={styles.benefitsGrid}>
            <div style={styles.benefitCard}>
              <h3>Environmental Impact</h3>
              <p>Directly contribute to reducing global carbon emissions.</p>
            </div>
            <div style={styles.benefitCard}>
              <h3>Financial Returns</h3>
              <p>Potential for financial returns while supporting sustainability.</p>
            </div>
            <div style={styles.benefitCard}>
              <h3>Corporate Responsibility</h3>
              <p>Meet ESG goals and demonstrate environmental commitment.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  navbar: {
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContent: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLink: {
    color: '#2e7d32',
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
      color: '#1b5e20',
    },
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  avatar: {
    backgroundColor: '#4caf50',
    color: 'white',
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  loginButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2e7d32',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 500,
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  hero: {
    backgroundColor: '#2e7d32',
    color: 'white',
    padding: '4rem 1rem',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: 800,
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    opacity: 0.9,
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  primaryButton: {
    padding: '1rem 2rem',
    backgroundColor: 'white',
    color: '#2e7d32',
    border: 'none',
    borderRadius: 8,
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  secondaryButton: {
    padding: '1rem 2rem',
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: 8,
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  section: {
    padding: '4rem 1rem',
    backgroundColor: 'white',
  },
  sectionContent: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  sectionTitle: {
    textAlign: 'center',
    color: '#2e7d32',
    marginBottom: '3rem',
    fontSize: '2rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: '2rem',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    textAlign: 'center',
  },
  step: {
    padding: '2rem',
  },
  stepNumber: {
    width: 40,
    height: 40,
    backgroundColor: '#2e7d32',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    fontWeight: 'bold',
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  benefitCard: {
    backgroundColor: '#f8f9fa',
    padding: '2rem',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    textAlign: 'center',
  },
}; 