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
  const [categorySummary, setCategorySummary] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [editTransaction, setEditTransaction] = useState({ id: '', description: '', amount: '', category: '', date: '' });

  useEffect(() => {
    fetchTransactions();
    fetchCategorySummary();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCategorySummary = async () => {
    try {
      const response = await axios.get('/api/category-summary');
      setCategorySummary(response.data);
    } catch (error) {
      console.error('Error fetching category summary:', error);
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

  const deleteTransaction = async () => {
    try {
      await axios.delete(`/api/transactions/${transactionToDelete}`);
      fetchTransactions();
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const clearTransactions = async () => {
    try {
      await axios.delete('/api/transactions');
      fetchTransactions();
      setShowClearModal(false);
    } catch (error) {
      console.error('Error clearing transactions:', error);
    }
  };

  const openEditModal = (transaction) => {
    setEditTransaction(transaction);
    setShowEditModal(true);
  };

  const updateTransaction = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/transactions/${editTransaction.id}`, editTransaction);
      fetchTransactions();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating transaction:', error);
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
      <div className="d-flex justify-content-between mb-3">
        <h2 className="h5">Transactions</h2>
        <button
          className="btn btn-danger"
          onClick={() => setShowClearModal(true)}
          disabled={transactions.length === 0}
        >
          Clear All Transactions
        </button>
      </div>
      <TransactionList
        transactions={transactions}
        onDelete={(id) => {
          setTransactionToDelete(id);
          setShowDeleteModal(true);
        }}
        onEdit={openEditModal}
      />

      {/* Spending Analysis Table */}
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5">Spending Analysis</h2>
          <button className="btn btn-secondary" onClick={fetchCategorySummary}>
            Refresh Analysis
          </button>
        </div>
        {categorySummary.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              {categorySummary.map((row, index) => (
                <tr key={index}>
                  <td>{row.category}</td>
                  <td>{row.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted">Run the Python script to generate spending analysis.</p>
        )}
      </div>

      {/* Savings Calculator */}
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
          <div className="alert alert-success" role="alert">
            Future Value: ${savingsResult.toFixed(2)}
          </div>
        )}
      </div>

      {/* Budget Checker */}
      <div className="savings-form mt-4">
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
          <div
            className={`alert ${budgetStatus.includes('exceeded') ? 'alert-danger' : 'alert-success'}`}
            role="alert"
          >
            {budgetStatus}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <div className={`modal fade ${showDeleteModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showDeleteModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Deletion</h5>
              <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this transaction?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={deleteTransaction}>Delete</button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear All Transactions Modal */}
      <div className={`modal fade ${showClearModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showClearModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Clear All</h5>
              <button type="button" className="btn-close" onClick={() => setShowClearModal(false)}></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to clear all transactions? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowClearModal(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={clearTransactions}>Clear All</button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <div className={`modal fade ${showEditModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showEditModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Transaction</h5>
              <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={updateTransaction}>
                <div className="mb-3">
                  <label htmlFor="editDescription" className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editDescription"
                    value={editTransaction.description}
                    onChange={(e) => setEditTransaction({ ...editTransaction, description: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editAmount" className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    id="editAmount"
                    value={editTransaction.amount}
                    onChange={(e) => setEditTransaction({ ...editTransaction, amount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editCategory" className="form-label">Category</label>
                  <select
                    className="form-select"
                    id="editCategory"
                    value={editTransaction.category}
                    onChange={(e) => setEditTransaction({ ...editTransaction, category: e.target.value })}
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;