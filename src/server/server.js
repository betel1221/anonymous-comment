const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
];
let comments = [];
let sessions = new Map();
let idCounter = 1;

const JWT_SECRET = 'your-secret-key'; // Change in production

// Profanity filter
const profanityList = ['badword1', 'badword2', 'curse'];
const checkProfanity = (text) => {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
};

// Rate limiting
const submissionLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_SUBMISSIONS = 3;

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  const user = sessions.get(token);
  if (!user) return res.status(403).json({ error: 'Invalid session' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Sign-up endpoint
app.post('/api/signup', (req, res) => {
  const { username, password, role } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  users.push({ username, password, role: role || 'user' });
  res.json({ success: true });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  sessions.set(token, user);
  res.json({ token, role: user.role });
});

// Logout endpoint
app.post('/api/logout', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  sessions.delete(token);
  res.json({ success: true });
});

// Change password endpoint
app.post('/api/change-password', authenticateToken, (req, res) => {
  const { username, newPassword } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  user.password = newPassword;
  res.json({ success: true });
});

// Get all comments
app.get('/api/comments', authenticateToken, (req, res) => {
  res.json(comments);
});

// Post a new comment
app.post('/api/comments', authenticateToken, (req, res) => {
  const { content, tag, status } = req.body;
  const username = req.user.username;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  if (checkProfanity(content)) {
    return res.status(400).json({ error: 'Comment contains inappropriate content' });
  }

  const clientIp = req.ip;
  const now = Date.now();
  const clientData = submissionLimits.get(clientIp) || { count: 0, firstSubmission: now };

  if (now - clientData.firstSubmission > RATE_LIMIT_WINDOW) {
    clientData.count = 0;
    clientData.firstSubmission = now;
  }
  if (clientData.count >= MAX_SUBMISSIONS) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
  }

  clientData.count += 1;
  submissionLimits.set(clientIp, clientData);

  const newComment = { id: idCounter++, content, tag, status: status || 'new', createdAt: new Date(), reply: '', username };
  comments.push(newComment);
  res.status(201).json(newComment);
});

// Update comment
app.patch('/api/comments/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { id } = req.params;
  const { action, reply } = req.body;
  const comment = comments.find(c => c.id === parseInt(id));

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  if (action && ['new', 'seen', 'handled'].includes(action)) {
    comment.status = action;
  } else if (reply) {
    comment.reply = reply;
    comment.status = 'replied';
  }

  res.json(comment);
});

// Get user replies
app.get('/api/user-replies', authenticateToken, (req, res) => {
  const username = req.user.username;
  const userReplies = comments.filter(c => c.username === username && c.reply);
  res.json(userReplies.map(c => ({ content: c.content, reply: c.reply, commentId: c.id })));
});

// Post user reply notification
app.post('/api/user-replies', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const { username, reply, commentId } = req.body;
  const comment = comments.find(c => c.id === commentId);
  if (comment && comment.username === username) {
    comment.reply = reply || comment.reply;
    comment.status = 'replied';
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Comment not found or user mismatch' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});