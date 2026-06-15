import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Keypad from '../components/Keypad';

const OP = { BALANCE: 'balance', WITHDRAW: 'withdraw', DEPOSIT: 'deposit', STATEMENT: 'statement' };

export default function ATMDashboard() {
  const { user, logout, updateBalance } = useAuth();
  const navigate = useNavigate();
  const [screen, setScreen] = useState('main'); // main | amount | result | statement
  const [operation, setOperation] = useState(null);
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(user?.balance ?? 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBalance(user.balance);
  }, [user, navigate]);

  const fetchBalance = async () => {
    try {
      const { data } = await API.get('/account/balance');
      const b = data.data.balance;
      setBalance(b);
      updateBalance(b);
      return b;
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to fetch balance');
      return null;
    }
  };

  const handleBalance = async () => {
    setOperation(OP.BALANCE);
    setLoading(true);
    const b = await fetchBalance();
    setLoading(false);
    setScreen('result');
    setMsg(b != null ? `Current Balance: ₹${b}` : 'Error');
  };

  const handleWithdraw = () => {
    setOperation(OP.WITHDRAW);
    setAmount('');
    setScreen('amount');
    setMsg('Enter amount to withdraw');
  };

  const handleDeposit = () => {
    setOperation(OP.DEPOSIT);
    setAmount('');
    setScreen('amount');
    setMsg('Enter amount to deposit');
  };

  const handleStatement = async () => {
    setOperation(OP.STATEMENT);
    setLoading(true);
    try {
      const { data } = await API.get('/account/transactions?limit=5');
      setTransactions(data.data || []);
      setScreen('statement');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load statement');
      setScreen('main');
    }
    setLoading(false);
  };

  const submitAmount = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      if (operation === OP.WITHDRAW) {
        const { data } = await API.post('/account/withdraw', { amount: amt });
        setBalance(data.data.balance);
        updateBalance(data.data.balance);
        setMsg(`Withdrew ₹${amt}. New balance: ₹${data.data.balance}`);
      } else if (operation === OP.DEPOSIT) {
        const { data } = await API.post('/account/deposit', { amount: amt });
        setBalance(data.data.balance);
        updateBalance(data.data.balance);
        setMsg(`Deposited ₹${amt}. New balance: ₹${data.data.balance}`);
      }
      toast.success(operation === OP.WITHDRAW ? 'Withdrawal successful' : 'Deposit successful');
      setScreen('result');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Transaction failed');
    }
    setLoading(false);
  };

  const backToMain = () => {
    setScreen('main');
    setOperation(null);
    setAmount('');
    setMsg('');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  if (!user) return null;

  const displayBalance = Number(balance) || 0;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-800 shadow-lg border-2 border-slate-600 overflow-hidden">
        {/* ATM frame header */}
        <div className="bg-slate-900 py-2 px-4 border-b border-slate-600">
          <div className="flex justify-between items-center">
            <span className="text-[#22c55e] font-semibold text-sm">Smart ATM</span>
            <span className="text-slate-400 text-xs font-mono">{user?.accountNumber || '---'}</span>
          </div>
        </div>

        {/* Display screen */}
        <div className="bg-[#0f172a] p-6 min-h-[140px] border-b-4 border-slate-700">
          {screen === 'main' && (
            <div>
              <p className="text-slate-400 text-sm text-center mb-1">Welcome, {user?.name || 'User'}</p>
              <p className="text-[#22c55e] font-semibold text-2xl text-center py-2">
                ₹{displayBalance.toLocaleString('en-IN')}
              </p>
              <p className="text-slate-500 text-xs text-center">Balance</p>
            </div>
          )}
          {screen === 'amount' && (
            <div>
              <p className="text-slate-400 text-sm mb-2">{msg}</p>
              <p className="text-[#22c55e] font-mono text-3xl break-all">
                {amount || '0'}
              </p>
            </div>
          )}
          {screen === 'result' && (
            <div>
              <p className="text-[#22c55e] font-mono text-lg">{msg}</p>
              <p className="text-slate-500 text-sm mt-2">Press Back to continue</p>
            </div>
          )}
          {screen === 'statement' && (
            <div className="text-slate-300 text-sm space-y-1 max-h-32 overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-slate-500">No transactions yet</p>
              ) : (
                transactions.map((t, i) => (
                  <div key={i} className="flex justify-between font-mono">
                    <span className={t.type === 'deposit' ? 'text-atm-neon' : 'text-amber-400'}>
                      {t.type === 'deposit' ? '+' : '-'}₹{t.amount}
                    </span>
                    <span className="text-slate-500">₹{t.balanceAfter}</span>
                  </div>
                ))
              )}
            </div>
          )}
          {loading && (
            <p className="text-slate-500 text-sm animate-pulse">Processing...</p>
          )}
        </div>

        {/* Operation buttons */}
        <div className="p-4 grid grid-cols-2 gap-2">
          <button
            onClick={handleBalance}
            disabled={loading}
            className="py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-orbitron text-sm transition disabled:opacity-50"
          >
            Balance
          </button>
          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-orbitron text-sm transition disabled:opacity-50"
          >
            Withdraw
          </button>
          <button
            onClick={handleDeposit}
            disabled={loading}
            className="py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-orbitron text-sm transition disabled:opacity-50"
          >
            Deposit
          </button>
          <button
            onClick={handleStatement}
            disabled={loading}
            className="py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-orbitron text-sm transition disabled:opacity-50"
          >
            Mini Statement
          </button>
        </div>

        {/* Keypad or Back */}
        <div className="p-4 pt-0">
          {screen === 'result' || screen === 'statement' ? (
            <button
              onClick={backToMain}
              className="w-full py-3 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-orbitron transition hover:scale-[1.02]"
            >
              Back to Main
            </button>
          ) : (
            <Keypad
              value={amount}
              onChange={setAmount}
              onSubmit={
                screen === 'amount' && (operation === OP.WITHDRAW || operation === OP.DEPOSIT)
                  ? submitAmount
                  : undefined
              }
              disabled={loading}
            />
          )}
        </div>

        {/* Logout */}
        <div className="p-4 pt-0">
          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 font-orbitron text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <Link
        to="/training"
        className="mt-4 text-slate-400 hover:text-[#22c55e] text-sm transition"
      >
        Financial Literacy Training →
      </Link>
    </div>
  );
}
