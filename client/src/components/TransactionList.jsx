function TransactionList({ transactions }) {
    return (
        <div className="transaction-list">
            <h2 className="h5 mb-3">Transactions</h2>
            <ul className="list-group">
                {transactions.map((t) => (
                    <li key={t.id} className="list-group-item">
                        {t.description} - ${t.amount.toFixed(2)} ({t.category}) on{' '}
                        {new Date(t.date).toLocaleDateString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TransactionList;