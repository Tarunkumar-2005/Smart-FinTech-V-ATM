# Smart ATM & Financial Literacy Simulator

Full-stack application simulating an ATM with financial literacy training.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT |
| Security | bcrypt for PIN hashing |

## Quick Start

### 1. Backend

```bash
cd backend
npm install
# Ensure MongoDB is running (local or Atlas)
# Copy .env.example to .env and set MONGODB_URI
npm run dev
```

Backend: `http://localhost:5000`

### 2. Seed Sample Data (Optional)

```bash
cd backend
npm run seed
```

Creates admin (1234567890 / 1234) and sample users.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

### 4. Use the App

- Register a new account or login with sample data
- Admin: Account `1234567890`, PIN `1234`

## Project Structure

```
MINI-PROJECT/
├── backend/          # Express API
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/         # React SPA
│   └── src/
│       ├── pages/
│       ├── components/
│       └── context/
└── README.md
```

## Features

- ATM simulation (Withdraw, Deposit, Balance, Mini Statement)
- 4-digit PIN authentication
- Daily withdrawal limit (₹10,000)
- Financial literacy training content
- Admin dashboard (users & transactions)
