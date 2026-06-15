import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      toast.error('Access denied');
      navigate('/atm');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, tRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/transactions'),
      ]);
      setUsers(uRes.data.data || []);
      setTransactions(tRes.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load data');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-atm-dark">
      <header className="bg-atm-panel border-b border-slate-700 px-4 py-4 flex justify-between items-center">
        <h1 className="text-atm-neon font-orbitron font-semibold text-xl">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          Logout
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-lg font-orbitron text-sm transition ${
              tab === 'users'
                ? 'bg-atm-neon text-atm-dark'
                : 'bg-atm-panel text-slate-400 hover:text-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setTab('transactions')}
            className={`px-4 py-2 rounded-lg font-orbitron text-sm transition ${
              tab === 'transactions'
                ? 'bg-atm-neon text-atm-dark'
                : 'bg-atm-panel text-slate-400 hover:text-white'
            }`}
          >
            Transactions
          </button>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : tab === 'users' ? (
          <div className="rounded-xl bg-atm-panel border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600 text-left text-slate-400">
                    <th className="p-4">Name</th>
                    <th className="p-4">Account</th>
                    <th className="p-4">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-slate-700">
                      <td className="p-4 text-slate-200">{u.name}</td>
                      <td className="p-4 font-mono text-atm-neon">{u.accountNumber}</td>
                      <td className="p-4 font-mono">{u.balance?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-atm-panel border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-atm-panel">
                  <tr className="border-b border-slate-600 text-left text-slate-400">
                    <th className="p-4">Type</th>
                    <th className="p-4">Amount (₹)</th>
                    <th className="p-4">Balance After</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id} className="border-b border-slate-700">
                      <td className="p-4">
                        <span
                          className={
                            t.type === 'deposit'
                              ? 'text-atm-neon'
                              : 'text-amber-400'
                          }
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="p-4 font-mono">₹{t.amount?.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-mono">₹{t.balanceAfter?.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-slate-300">
                        {t.userId?.name} ({t.userId?.accountNumber})
                      </td>
                      <td className="p-4 text-slate-500 text-xs">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
