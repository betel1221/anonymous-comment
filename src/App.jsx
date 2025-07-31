// src/App.jsx
import { useState, createContext } from 'react';
import axios from 'axios';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import AdminPanel from './components/AdminPanel';
import './styles.css'; // Keep this if you have custom CSS in styles.css
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Keep if used in App.jsx

library.add(fas);

export const ThemeContext = createContext();
export const AuthContext = createContext();

// --- ADD THIS LINE ---
// Define the API base URL using Vite's environment variable import.meta.env
// This will be replaced by Netlify with the actual backend URL during build time.
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
// --- END ADDITION ---


function App() {
  const [theme, setTheme] = useState('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(null);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      // --- MODIFY THIS LINE ---
      await axios.post(`${API_BASE_URL}/api/logout`, {}, { // Use the API_BASE_URL variable
        headers: { Authorization: `Bearer ${token}` },
      });
      // --- END MODIFICATION ---
      setIsAuthenticated(false);
      setUserRole(null);
      setIsAdmin(false);
      setToken(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ token, setToken, isAuthenticated, setIsAuthenticated, userRole, setUserRole, isAdmin, setIsAdmin }}>
        <div className={`app-container ${theme}`}>
          {!isAuthenticated ? (
            <LoginPage />
          ) : userRole === 'admin' ? (
            <AdminPanel handleLogout={handleLogout} />
          ) : (
            <MainPage handleLogout={handleLogout} />
          )}
        </div>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;