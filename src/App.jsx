import { useState, createContext } from 'react';
import axios from 'axios';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';
import AdminPanel from './components/AdminPanel';
import './styles.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(fas);

export const ThemeContext = createContext();
export const AuthContext = createContext();

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
      await axios.post('http://localhost:3000/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
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