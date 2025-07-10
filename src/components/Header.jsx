import React, { useContext } from 'react';
import { ThemeContext } from '../App';

function Header({ handleLogout }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header>
      <h1>Commenting App</h1>
      <div style={{ textAlign: 'right' }}>
        <button onClick={handleLogout}>Logout</button>
        <button
          onClick={toggleTheme}
          style={{
            marginLeft: '10px',
            padding: '5px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            transition: 'transform 0.3s ease',
            transform: theme === 'dark' ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          {theme === 'light' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

export default Header;