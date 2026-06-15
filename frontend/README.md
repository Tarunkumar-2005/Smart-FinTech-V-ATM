# Smart ATM & Financial Literacy Simulator - Frontend

React + Tailwind CSS frontend for the Smart ATM application.

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment (Optional)

Create `.env` if backend runs on a different URL:

```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Pages

- **Login** – Account number + 4-digit PIN
- **Register** – Name + 4-digit PIN (auto-generates account number)
- **ATM Dashboard** – Withdraw, Deposit, Balance, Mini Statement + numeric keypad
- **Training** – Financial literacy content (ATM, PIN, limits, saving, safety)
- **Admin Dashboard** – Users and transactions (admin role only)

## Tech Stack

- React 19 + Vite
- Tailwind CSS
- React Router
- Axios
- react-hot-toast
