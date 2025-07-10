import React from 'react';

function UserPanel({ newComment, setNewComment, selectedTag, setSelectedTag, emoji, setEmoji, handleSubmit, tags, error }) {
  return (
    <div className="user-panel">
      <h2>Submit a Comment or Report</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Emoji Reaction</label>
          <select
            className="select"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
          >
            <option value="">Select Emoji</option>
            <option value="😊">😊</option>
            <option value="😢">😢</option>
            <option value="👍">👍</option>
            <option value="🚨">🚨</option>
          </select>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select
            className="select"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">Select Category</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Comment</label>
          <textarea
            className="textarea"
            rows="5"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Enter your comment or report anonymously..."
          ></textarea>
        </div>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
}

export default UserPanel;