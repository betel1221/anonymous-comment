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

function AdminPanel({ handleLogout }) {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState({ category: '', keyword: '', date: '' });
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { token } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const tags = ['#HR', '#Suggestion', '#Concern'];
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [changeUsername, setChangeUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [changeError, setChangeError] = useState('');
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    // --- MODIFY THIS AXIOS CALL ---
    axios.get(`${API_BASE_URL}/api/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setComments(res.data))
      .catch(err => console.error('Error fetching comments:', err));
  }, [token]);

  const handleAdminAction = async (id, action, reply = '') => {
    try {
      const comment = comments.find(c => c.id === id);
      let updatedComment = { ...comment };
      if (action && ['new', 'seen', 'handled'].includes(action)) {
        updatedComment.status = action;
      } else if (reply) {
        updatedComment.reply = reply;
        updatedComment.status = 'replied';
        // --- MODIFY THIS AXIOS CALL ---
        await axios.post(`${API_BASE_URL}/api/user-replies`, {
          username: comment.username,
          reply,
          commentId: id,
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      // --- MODIFY THIS AXIOS CALL ---
      const response = await axios.patch(
        `${API_BASE_URL}/api/comments/${id}`,
        { action: updatedComment.status, reply: updatedComment.reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.map(c => c.id === id ? response.data : c));
      setReplyText(prev => ({ ...prev, [id]: '' }));
    } catch (err) {
      console.error('Error updating comment:', err);
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

  const filteredComments = comments.filter(comment => {
    const matchesCategory = filter.category ? comment.tag === filter.category : true;
    const matchesKeyword = filter.keyword
      ? comment.content.toLowerCase().includes(filter.keyword.toLowerCase())
      : true;
    const matchesDate = filter.date
      ? new Date(comment.createdAt).toDateString() === new Date(filter.date).toDateString()
      : true;
    return matchesCategory && matchesKeyword && matchesDate;
  });

  return (
    <div className={`admin-container ${theme}`}>
      <header className="admin-header">
        <div className="header-content">
          <div className="logo-placeholder">
            {/* --- MODIFY THIS LINE for logo --- */}
            <img src={logoImage} alt="Techtonic Tribe Logo" />
          </div>
          <span>Admin Side</span>
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
      <div className="filter-section">
        <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })} className="select-input">
          <option value="">All Categories</option>
          {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
        <input
          type="text"
          value={filter.keyword}
          onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
          placeholder="Search keyword..."
          className="text-input"
        />
        <input
          type="date"
          value={filter.date}
          onChange={(e) => setFilter({ ...filter, date: e.target.value })}
          placeholder="Filter by date" // Added placeholder for clarity
          className="date-input"
        />
      </div>
      <div className="comments-list">
        {filteredComments.map(comment => (
          <div key={comment.id} className="comment-item">
            <p>{comment.content}</p>
            <p>
              {new Date(comment.createdAt).toLocaleString()} | Status: {comment.status}
            </p>
            <select
              value={comment.status}
              onChange={(e) => handleAdminAction(comment.id, e.target.value)}
              className="select-input"
            >
              <option value="new">New</option>
              <option value="seen">Seen</option>
              <option value="handled">Handled</option>
            </select>
            <input
              type="text"
              value={replyText[comment.id] || ''}
              onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
              placeholder="Reply..."
              className="text-input"
            />
            <button onClick={() => handleAdminAction(comment.id, null, replyText[comment.id])} className="submit-button">Send Reply</button>
          </div>
        ))}
      </div>
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

export default AdminPanel;