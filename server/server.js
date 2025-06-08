const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('finance.db', (err) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to SQLite database');
});

db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    amount REAL,
    category TEXT,
    date TEXT
  )
`);

app.get('/api/transactions', (req, res) => {
    db.all('SELECT * FROM transactions', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/transactions', (req, res) => {
    const { description, amount, category, date } = req.body;
    db.run(
        'INSERT INTO transactions (description, amount, category, date) VALUES (?, ?, ?, ?)',
        [description, amount, category, date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

app.post('/api/calculate-interest', (req, res) => {
    const { principal, rate, years } = req.body;
    if (!principal || !rate || !years) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const futureValue = principal * Math.pow(1 + rate / 100, years);
    res.json({ futureValue });
});

app.post('/api/check-budget', (req, res) => {
    const { budget, totalSpent } = req.body;
    if (!budget || !totalSpent) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const message = totalSpent > budget
        ? 'Alert: You have exceeded your budget!'
        : 'You are within your budget.';
    res.json({ message });
});

app.listen(3000, () => console.log('Server running on port 3000'));