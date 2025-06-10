# Personal Finance Dashboard

Welcome to the **Personal Finance Dashboard**, a full-stack web application designed to help users manage their finances effectively. This project provides a user-friendly interface to track expenses, analyze spending patterns, set budgets, and plan savings, all while incorporating modern design elements like animations and theme toggling. Built with a focus on modularity and scalability, it serves as a practical tool for personal finance management and a learning resource for full-stack development.

## Overview

The Personal Finance Dashboard allows users to securely manage their financial data through a responsive web application. With features like user authentication, transaction tracking, and spending analysis, it empowers users to gain insights into their financial habits and make informed decisions. The project leverages a modern tech stack, combining a React frontend with a Node.js backend, and includes advanced UI elements like particle effects and interactive charts.

## Tech Stack

### Frontend
- **React**: For building a dynamic and responsive user interface.
- **Vite**: As the build tool for faster development and optimized production builds.
- **Axios**: For making HTTP requests to the backend API.
- **Bootstrap**: For responsive styling and pre-built UI components.
- **React-Datepicker**: For date-based filtering of transactions.
- **Chart.js & React-Chartjs-2**: For rendering interactive pie charts to visualize spending by category.
- **Particles.js**: For adding an animated particle background that adapts to light/dark themes.

### Backend
- **Node.js & Express**: For creating a RESTful API to handle requests and manage server logic.
- **SQLite**: As a lightweight database to store user and transaction data.
- **Express-Session**: For session-based user authentication.
- **Bcrypt**: For securely hashing user passwords.
- **CORS**: To enable cross-origin requests between the frontend and backend.

### Development Tools
- **Git & GitHub**: For version control and project hosting.
- **NPM**: For package management on both frontend and backend.

## Features

### Core Functionalities
- **User Authentication**:
  - Register, login, and logout functionality with session-based authentication.
  - Passwords are securely hashed using Bcrypt.
  - User-specific data isolation ensures each user’s transactions are private.
- **Transaction Management**:
  - Add, edit, delete, and clear transactions with real-time updates.
  - Transactions include description, amount, category, and date.
  - Export transactions to CSV for external use.
- **Spending Analysis**:
  - A pie chart visualizes spending by category (e.g., Food, Transport, Entertainment).
  - A summary card displays total transactions, total spent, and average transaction amount.
  - A table shows category-wise spending analysis (fetched via API).
- **Filtering**:
  - Filter transactions by category using a dropdown.
  - Date-based filtering with a start and end date picker.
- **Savings and Budget Tools**:
  - Savings calculator to compute future value based on principal, rate, and years.
  - Budget checker to compare total spending against a user-defined budget, with alerts for overspending.

### UI/UX Enhancements
- **Theme Toggling**:
  - Switch between light and dark modes, with preferences saved in localStorage.
  - Particle effects adapt to the selected theme for a visually appealing background.
- **Animations**:
  - Fade-in animations for UI elements (transactions, alerts, sections).
  - Scale-in animation for the pie chart.
  - Button hover effects with scale and shadow transitions.
- **Responsive Design**:
  - Built with Bootstrap to ensure the app is mobile-friendly and works across devices.
  - Collapsible navbar for better navigation on smaller screens.

### Security
- **Session Management**: Uses `express-session` to manage user sessions securely.
- **Protected Routes**: Middleware ensures only authenticated users can access the dashboard and API endpoints.
- **CORS Configuration**: Allows secure communication between the frontend (`localhost:5173`) and backend (`localhost:3000`).

## Project Structure

```
Personal-Finance-Dashboard/
├── client/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # Reusable React components (TransactionForm, TransactionList)
│   │   ├── App.jsx           # Main app component
│   │   ├── App.css           # Global styles
│   │   ├── background.css    # Particle background styles
│   │   └── index.css         # Entry point styles
│   ├── vite.config.js        # Vite configuration with proxy setup
│   ├── package.json          # Frontend dependencies
│   └── public/               # Static assets
├── server/                   # Backend (Node.js + Express)
│   ├── db/                   # Database setup
│   │   └── finance.db        # SQLite database file
│   ├── routes/               # API routes
│   │   └── api.js            # Route definitions
│   ├── server.js             # Main server file
│   └── package.json          # Backend dependencies
├── analyze_spending.py       # Python script for spending analysis
└── README.md                 # Project documentation
```

## Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher)
- **NPM** (v8 or higher)
- **SQLite** (for the database)
- **Python** (for the spending analysis script)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/tarunganesh2004/Personal-Finance-Dashboard.git
   cd Personal-Finance-Dashboard
   ```

2. **Set Up the Backend**:
   ```bash
   cd server
   npm install
   ```
   - Ensure SQLite is installed, as the database (`finance.db`) is created automatically.
   - Update the session secret in `server.js`:
     ```javascript
     app.use(session({
       secret: 'your-session-secret', // Replace with a secure value
       resave: false,
       saveUninitialized: false,
       cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // Secure: true in production
     }));
     ```
   - Start the backend server:
     ```bash
     npm start
     ```
     The server will run on `http://localhost:3000`.

3. **Set Up the Frontend**:
   ```bash
   cd ../client
   npm install
   ```
   - Ensure the Vite proxy is configured in `vite.config.js` to forward API requests to the backend:
     ```javascript
     server: {
       proxy: {
         '/api': {
           target: 'http://localhost:3000',
           changeOrigin: true,
           secure: false,
         },
       },
     }
     ```
   - Start the frontend development server:
     ```bash
     npm run dev
     ```
     The app will run on `http://localhost:5173`.

4. **Run the Spending Analysis Script (Optional)**:
   - Ensure Python and required packages (`pandas`, `sqlite3`) are installed:
     ```bash
     pip install pandas
     ```
   - Run the script to generate category-wise spending analysis:
     ```bash
     python analyze_spending.py
     ```

### Usage
1. Open the app in your browser at `http://localhost:5173`.
2. Register a new user or log in with existing credentials.
3. Add transactions, filter them by category or date, and explore spending patterns via the pie chart and analysis table.
4. Use the savings calculator and budget checker to plan your finances.
5. Toggle between light and dark themes for a personalized experience.

## Real-World Applications

The Personal Finance Dashboard can be used in various real-world scenarios:
- **Personal Budgeting**: Helps individuals track their daily expenses, set budgets, and avoid overspending, promoting financial discipline.
- **Financial Planning**: The savings calculator assists in planning for future goals, such as buying a car or saving for retirement.
- **Expense Analysis**: Provides insights into spending habits, allowing users to identify areas for cost-cutting (e.g., reducing dining expenses).
- **Educational Tool**: Serves as a learning resource for students or developers interested in full-stack development, demonstrating the integration of React, Node.js, and SQLite.
- **Small Business Use**: Can be adapted for small business owners to track business expenses and manage cash flow.

## Feature Improvements

Here are some potential enhancements to make the dashboard even more powerful:
- **Password Recovery**: Add a "Forgot Password" feature with email-based reset (requires an email service setup).
- **Backend-Based Filtering**: Implement server-side filtering for transactions to improve performance with large datasets.
- **Advanced Analytics**: Integrate machine learning models (e.g., using scikit-learn) to predict future spending trends or recommend budgets.
- **Multi-Currency Support**: Allow users to manage transactions in different currencies with real-time conversion.
- **Mobile App**: Develop a mobile version using React Native to make the app accessible on iOS and Android devices.
- **Notifications**: Add push notifications for budget alerts or upcoming financial goals (requires a notification service).
- **Data Import**: Enable users to import transactions from CSV or bank statements, similar to other finance tools like Firefly III.

## Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, please:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## Acknowledgments

- Thanks to the open-source community for providing tools like React, Node.js, and SQLite.
- Inspired by various personal finance projects on GitHub, such as Firefly III and other dashboards that focus on budgeting and financial insights.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.