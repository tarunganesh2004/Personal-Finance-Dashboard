// @ts-nocheck
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));

// Database setup
const db = new sqlite3.Database('./db/finance.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize database with users and transactions tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    amount REAL,
    category TEXT,
    date TEXT,
    userId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Register endpoint
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Username already exists' });
                    }
                    return res.status(500).json({ error: 'Error registering user' });
                }
                res.status(201).json({ message: 'User registered successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.session.user = { id: user.id, username: user.username };
        res.json({ message: 'Login successful', user: { username: user.username } });
    });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Get current user endpoint
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({ user: { username: req.session.user.username } });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Transactions endpoints (protected)
app.get('/api/transactions', isAuthenticated, (req, res) => {
    db.all('SELECT * FROM transactions WHERE userId = ?', [req.session.user.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching transactions' });
        }
        res.json(rows);
    });
});

app.post('/api/transactions', isAuthenticated, (req, res) => {
    const { description, amount, category, date } = req.body;
    db.run(
        'INSERT INTO transactions (description, amount, category, date, userId) VALUES (?, ?, ?, ?, ?)',
        [description, amount, category, date, req.session.user.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error adding transaction' });
            }
            res.status(201).json({ id: this.lastID });
        }
    );
});

app.put('/api/transactions/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    const { description, amount, category } = req.body;
    db.run(
        'UPDATE transactions SET description = ?, amount = ?, category = ? WHERE id = ? AND userId = ?',
        [description, amount, category, id, req.session.user.id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error updating transaction' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Transaction not found or not authorized' });
            }
            res.json({ message: 'Transaction updated' });
        }
    );
});

app.delete('/api/transactions/:id', isAuthenticated, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM transactions WHERE id = ? AND userId = ?', [id, req.session.user.id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error deleting transaction' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Transaction not found or not authorized' });
        }
        res.json({ message: 'Transaction deleted' });
    });
});

app.delete('/api/transactions', isAuthenticated, (req, res) => {
    db.run('DELETE FROM transactions WHERE userId = ?', [req.session.user.id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Error clearing transactions' });
        }
        res.json({ message: 'All transactions cleared' });
    });
});

// Category summary endpoint (protected)
app.get('/api/category-summary', isAuthenticated, (req, res) => {
    db.all(
        'SELECT category, SUM(amount) as amount FROM transactions WHERE userId = ? GROUP BY category',
        [req.session.user.id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching category summary' });
            }
            res.json(rows);
        }
    );
});

// Interest calculation endpoint
app.post('/api/calculate-interest', (req, res) => {
    const { principal, rate, years } = req.body;
    const futureValue = principal * Math.pow(1 + rate / 100, years);
    res.json({ futureValue });
});

// Budget check endpoint (protected)
app.post('/api/check-budget', isAuthenticated, (req, res) => {
    const { budget, totalSpent } = req.body;
    if (totalSpent > budget) {
        res.json({ message: `Budget exceeded by $${(totalSpent - budget).toFixed(2)}` });
    } else {
        res.json({ message: `Within budget by $${(budget - totalSpent).toFixed(2)}` });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});