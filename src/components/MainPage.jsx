import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, ThemeContext } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// --- ADD THIS LINE ---
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
// --- END ADDITION ---

// --- ADD THIS LINE for logo ---
import logoImage from '../assets/logo.png';
// --- END ADDITION ---

function MainPage({ handleLogout }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const tags = ['#HR', '#Suggestion', '#Concern'];
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeUsername, setChangeUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changeError, setChangeError] = useState('');
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    // --- MODIFY THIS AXIOS CALL ---
    axios.get(`${API_BASE_URL}/api/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setComments(res.data))
      .catch(err => console.error('Error fetching comments:', err));
    fetchReplies();
  }, [token]);

  const fetchReplies = async () => {
    try {
      // --- MODIFY THIS AXIOS CALL ---
      const response = await axios.get(`${API_BASE_URL}/api/user-replies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReplies(response.data);
    } catch (err) {
      console.error('Error fetching replies:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      // --- MODIFY THIS AXIOS CALL ---
      const response = await axios.post(
        `${API_BASE_URL}/api/comments`,
        { content: newComment, tag: selectedTag, status: 'new' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, response.data]);
      setNewComment('');
      setSelectedTag('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  };

  const handleChangeSubmit = async (e) => {
    e.preventDefault();
    try {
      // --- MODIFY THIS AXIOS CALL ---
      const loginResponse = await axios.post(`${API_BASE_URL}/api/login`, {
        username: prompt('Enter your username:'),
        password: currentPassword,
      });
      if (loginResponse.data.token) {
        // --- MODIFY THIS AXIOS CALL ---
        await axios.post(
          `${API_BASE_URL}/api/change-password`,
          { username: changeUsername || prompt('Enter your username:'), newPassword },
          { headers: { Authorization: `Bearer ${loginResponse.data.token}` } }
        );
        setChangeError('Changes saved successfully');
        setShowChangeForm(false);
      } else {
        setChangeError('Invalid current password');
      }
    } catch (err) {
      setChangeError('An error occurred');
    }
    setChangeUsername('');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className={`main-container ${theme}`}>
      <header className="main-header">
        <div className="header-content">
          <div className="logo-placeholder">
            {/* --- MODIFY THIS LINE for logo --- */}
            <img src={logoImage} alt="Techtonic Tribe Logo" />
          </div>
          <span>User Side</span>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout}>Logout</button>
          <button onClick={() => setShowChangeForm(true)}>Change Password/Username</button>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            <FontAwesomeIcon icon={theme === 'light' ? 'fa-sun' : 'fa-moon'} style={{ color: '#3498db' }} />
          </button>
        </div>
      </header>
      <div className="description">
        <p>Welcome to the Techtonic Tribe commenting platform. Share your concerns, suggestions, or ideas!</p>
      </div>
      <div className="comment-section">
        <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="select-input">
          <option value="">Select Category</option>
          {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Enter your comment..."
          rows="4"
          className="textarea-input"
        />
        <button onClick={handleSubmit} className="submit-button">Submit</button>
        {error && <p className="error">{error}</p>}
      </div>
      {replies.length > 0 && (
        <div className="replies-section">
          <h3>Your Replies</h3>
          {replies.map((reply, index) => (
            <div key={index} className="reply-item">
              <p>{reply.content}</p>
              <p>Replied by Admin: {reply.reply}</p>
            </div>
          ))}
        </div>
      )}
      {showChangeForm && (
        <div className="modal" onClick={() => setShowChangeForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Change Credentials</h2>
            <form onSubmit={handleChangeSubmit}>
              <input
                type="text"
                value={changeUsername}
                onChange={(e) => setChangeUsername(e.target.value)}
                placeholder="New Username"
                className="modal-input"
              />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                required
                className="modal-input"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                required
                className="modal-input"
              />
              <button type="submit" className="modal-button">Save Changes</button>
              <button type="button" onClick={() => setShowChangeForm(false)} className="modal-button cancel">Cancel</button>
            </form>
            {changeError && <p className="error">{changeError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;