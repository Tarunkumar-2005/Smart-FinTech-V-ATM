# Smart ATM & Financial Literacy Simulator - Backend

Node.js + Express.js backend with MongoDB, JWT auth, and bcrypt for PIN hashing.

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-atm
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

For MongoDB Atlas, use: `mongodb+srv://user:pass@cluster.mongodb.net/smart-atm`

### 3. Run the Server

```bash
# Production
npm start

# Development (with nodemon)
npm run dev
```

Server runs at `http://localhost:5000`

### 4. Seed Sample Data (Optional)

```bash
npm run seed
```

Creates:
- **Admin**: Account `1234567890`, PIN `1234`
- **Sample users**: John Doe (1234), Jane Smith (5678), Alice Johnson (9999)
- Sample transactions for John Doe

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | No | Register new account |
| POST | /api/auth/login | No | Login with account + PIN |
| GET | /api/account/balance | Yes | Get balance |
| POST | /api/account/deposit | Yes | Deposit money |
| POST | /api/account/withdraw | Yes | Withdraw money |
| GET | /api/account/transactions | Yes | Mini statement (last 5) |
| GET | /api/admin/users | Admin | List all users |
| GET | /api/admin/transactions | Admin | List all transactions |

## Business Logic

- **Daily Withdrawal Limit**: ₹10,000 per day (resets at midnight)
- **Default Balance**: ₹5,000 for new accounts
- **Account Number**: Auto-generated 10-digit unique number
- **PIN**: 4-digit, hashed with bcrypt

## Project Structure

```
backend/
├── config/
│   └── db.js           # MongoDB connection
├── controllers/
│   ├── authController.js
│   ├── accountController.js
│   └── adminController.js
├── middleware/
│   └── auth.js         # JWT protect & admin
├── models/
│   ├── User.js
│   └── Transaction.js
├── routes/
│   ├── authRoutes.js
│   ├── accountRoutes.js
│   └── adminRoutes.js
├── utils/
│   ├── generateToken.js
│   ├── validation.js
│   └── seedData.js
├── server.js
├── .env
├── .env.example
├── package.json
├── POSTMAN_EXAMPLES.md
└── README.md
```
