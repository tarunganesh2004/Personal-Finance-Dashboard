function TransactionList({ transactions, onDelete, onEdit }) {
    return (
        <div className="transaction-list">
            <ul className="list-group">
                {transactions.map((t) => (
                    <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                            {t.description} - ${t.amount.toFixed(2)} ({t.category}) on{' '}
                            {new Date(t.date).toLocaleDateString()}
                        </span>
                        <div>
                            <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => onEdit(t)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => onDelete(t.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TransactionList;