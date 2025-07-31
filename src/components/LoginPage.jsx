import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext, ThemeContext } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logoImage from '../assets/logo.png'; // Make sure this path is correct relative to the component!

// --- ADD THIS LINE (same as in App.jsx) ---
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
// --- END ADDITION ---

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { setIsAuthenticated, setUserRole, setIsAdmin, setToken } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        // --- MODIFY THIS LINE ---
        const response = await axios.post(`${API_BASE_URL}/api/signup`, { username, password, role: 'user' });
        // --- END MODIFICATION ---
        if (response.data.success) {
          setIsSignUp(false);
          setError('Account created. Please log in.');
        }
      } else {
        // --- MODIFY THIS LINE ---
        const response = await axios.post(`${API_BASE_URL}/api/login`, { username, password });
        // --- END MODIFICATION ---
        setToken(response.data.token);
        setIsAuthenticated(true);
        setUserRole(response.data.role);
        setIsAdmin(response.data.role === 'admin');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className={`login-container ${theme}`}>
      <header className="login-header">
        <h1>Techtonic Tribe</h1>
        <div className="logo-placeholder">
          {/* --- MODIFY THIS LINE --- */}
          <img src={logoImage} alt="Techtonic Tribe Logo"/>
          {/* OR, if you're not using require, you need to import it:
              import logoImage from '../assets/logo.png';
              <img src={logoImage} alt="Techtonic Tribe Logo" />
          */}
        </div>
      </header>
      <div className="login-actions">
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label="Toggle theme"
        >
          <FontAwesomeIcon icon={theme === 'light' ? 'fa-sun' : 'fa-moon'} style={{ color: '#3498db' }} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="login-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="login-input"
        />
        <button type="submit" className="pulse-button">{isSignUp ? 'Sign Up' : 'Login'}</button>
        <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="toggle-button">
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;