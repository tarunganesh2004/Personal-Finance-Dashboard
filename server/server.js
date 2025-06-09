const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('finance.db', (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to SQLite database');
});

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    description TEXT,
    amount REAL,
    category TEXT,
    date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Register user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        function (err) {
            if (err) return res.status(400).json({ error: 'Username already exists' });
            res.json({ message: 'User registered successfully' });
        }
    );
});

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Invalid username or password' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid username or password' });

        const token = jwt.sign({ id: user.id, username: user.username }, 'your-secret-key', { expiresIn: '1h' });
        res.json({ token });
    });
});

// Get transactions for authenticated user
app.get('/api/transactions', authenticateToken, (req, res) => {
    db.all('SELECT * FROM transactions WHERE user_id = ?', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add transaction for authenticated user
app.post('/api/transactions', authenticateToken, (req, res) => {
    const { description, amount, category, date } = req.body;
    db.run(
        'INSERT INTO transactions (user_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, description, amount, category, date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// Calculate compound interest
app.post('/api/calculate-interest', authenticateToken, (req, res) => {
    const { principal, rate, years } = req.body;
    if (!principal || !rate || !years) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const futureValue = principal * Math.pow(1 + rate / 100, years);
    res.json({ futureValue });
});

// Check budget
app.post('/api/check-budget', authenticateToken, (req, res) => {
    const { budget, totalSpent } = req.body;
    if (!budget || !totalSpent) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const message = totalSpent > budget
        ? 'Alert: You have exceeded your budget!'
        : 'You are within your budget.';
    res.json({ message });
});

// Get spending analysis
app.get('/api/analysis', authenticateToken, (req, res) => {
    db.all('SELECT * FROM category_summary', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));