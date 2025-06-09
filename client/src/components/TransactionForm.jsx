import { useState } from 'react';

function TransactionForm({ onAddTransaction }) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !amount) return;
        onAddTransaction({
            description,
            amount: parseFloat(amount),
            category,
            date: new Date().toISOString(),
        });
        setDescription('');
        setAmount('');
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="row g-3">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div className="col-md-3">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="col-md-2">
                    <button type="submit" className="btn btn-primary w-100">Add</button>
                </div>
            </div>
        </form>
    );
}

export default TransactionForm;