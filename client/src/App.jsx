// @ts-nocheck
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [transactions, setTransactions] = useState([]);
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [budget, setBudget] = useState('');
  const [savingsResult, setSavingsResult] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const addTransaction = async (transaction) => {
    try {
      await axios.post('/api/transactions', transaction);
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const calculateSavings = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/calculate-interest', {
        principal: parseFloat(principal),
        rate: parseFloat(rate),
        years: parseInt(years),
      });
      setSavingsResult(response.data.futureValue);
    } catch (error) {
      console.error('Error calculating interest:', error);
    }
  };

  const checkBudget = async (e) => {
    e.preventDefault();
    try {
      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const response = await axios.post('/api/check-budget', {
        budget: parseFloat(budget),
        totalSpent,
      });
      setBudgetStatus(response.data.message);
    } catch (error) {
      console.error('Error checking budget:', error);
    }
  };

  const chartData = {
    labels: [...new Set(transactions.map(t => t.category))],
    datasets: [{
      data: Object.values(
        transactions.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {})
      ),
      backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
    }],
  };

  return (
    <div className="container mt-4">
      <h1 className="display-6 text-center mb-4">Personal Finance Dashboard</h1>
      <TransactionForm onAddTransaction={addTransaction} />
      <div className="chart-container mb-4">
        <Pie data={chartData} options={{ responsive: true }} />
      </div>
      <TransactionList transactions={transactions} />
      <div className="savings-form mt-4">
        <h2 className="h5 mb-3">Savings Calculator</h2>
        <form onSubmit={calculateSavings} className="row g-3 mb-3">
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Principal ($)"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Rate (%)"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Years"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100">Calculate</button>
          </div>
        </form>
        {savingsResult && (
          <p className="text-success">
            Future Value: ${savingsResult.toFixed(2)}
          </p>
        )}
        <h2 className="h5 mb-3">Budget Checker</h2>
        <form onSubmit={checkBudget} className="row g-3">
          <div className="col-md-9">
            <input
              type="number"
              className="form-control"
              placeholder="Budget ($)"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100">Check</button>
          </div>
        </form>
        {budgetStatus && (
          <p className={budgetStatus.includes('exceeded') ? 'text-danger' : 'text-success'}>
            {budgetStatus}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;