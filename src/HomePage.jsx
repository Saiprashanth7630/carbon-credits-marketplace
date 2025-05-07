// src/pages/HomePage.jsx
import React from 'react';
import { useUser } from '../context/UserContext';

export default function HomePage() {
  const { user } = useUser();

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
        <div style={{
          backgroundColor: '#4caf50', color: '#fff', borderRadius: '50%',
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {user?.fullName?.[0] || '?'}
        </div>
        <div>
          <strong>{user?.fullName}</strong><br />
          <small>{user?.email}</small>
        </div>
      </header>

      <main style={{ marginTop: 40 }}>
        <h1>Welcome to the Carbon Credits Marketplace</h1>
        <p>You can now buy or sell carbon credits.</p>

        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <button style={btnStyle}>Buy Credits</button>
          <button style={btnStyle}>Sell Credits</button>
        </div>
      </main>
    </div>
  );
}

const btnStyle = {
  padding: '12px 24px',
  backgroundColor: '#2e7d32',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  fontSize: 16,
  cursor: 'pointer'
};
