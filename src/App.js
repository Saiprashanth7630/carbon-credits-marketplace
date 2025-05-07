// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import CarbonCreditsAuth from './pages/CarbonCreditsAuth';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/auth/:mode" element={<CarbonCreditsAuth />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
