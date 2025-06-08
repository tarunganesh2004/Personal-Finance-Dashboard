import sqlite3
import pandas as pd

def analyze_spending():
    conn = sqlite3.connect('../server/finance.db')
    query = 'SELECT category, amount FROM transactions'
    df = pd.read_sql_query(query, conn)
    conn.close()

    summary = df.groupby('category')['amount'].sum().reset_index()
    print("Spending by Category:")
    print(summary)

    total_spent = df['amount'].sum()
    print(f"\nTotal Spent: ${total_spent:.2f}")

    summary.to_sql('category_summary', sqlite3.connect('../server/finance.db'), if_exists='replace', index=False)

if __name__ == '__main__':
    analyze_spending()