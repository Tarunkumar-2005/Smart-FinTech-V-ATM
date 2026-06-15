import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Settings, User, LogOut, Eye, EyeOff, Hash, Banknote, X } from 'lucide-react';

export default function UserSettingsMenu() {
  const { user, logout, updateBalance } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showFullAcct, setShowFullAcct] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const menuRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);

  // Fetch real-time balance when menu opens
  useEffect(() => {
    if (isOpen && user) {
      const fetchBalance = async () => {
        setIsLoadingBalance(true);
        try {
          const { data } = await API.get('/account/balance');
          const latestBalance = data.data.balance;
          if (user.balance !== latestBalance) {
            updateBalance(latestBalance);
          }
        } catch (error) {
           console.error("Failed to fetch latest balance");
        } finally {
          setIsLoadingBalance(false);
        }
      };
      fetchBalance();
    }
  }, [isOpen, user, updateBalance]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/dashboard');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const maskAccount = (acc) => {
    if (!acc) return '••••••••••';
    return '•••• ' + acc.slice(-4);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Settings / Profile Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 ring-2 ring-blue-100 dark:ring-slate-700 relative overflow-hidden group"
      >
        <span className="text-white text-sm font-bold group-hover:scale-110 transition-transform">{getInitials(user.name)}</span>
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 animate-in fade-in slide-in-from-top-4 duration-200 overflow-hidden text-gray-800 dark:text-gray-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 relative">
             <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
                title="Close"
             >
                <X size={16} />
             </button>
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full bg-white/20 flex flex-shrink-0 items-center justify-center ring-2 ring-white/30 backdrop-blur-sm">
                 <span className="text-white text-lg font-bold">{getInitials(user.name)}</span>
               </div>
               <div className="min-w-0">
                 <h3 className="text-white font-bold text-lg truncate leading-tight">{user.name}</h3>
                 <p className="text-blue-100 text-xs">Account Holder</p>
               </div>
             </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Account Number Info */}
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-3 border border-gray-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <Hash size={12} /> Account Number
                </div>
                <button
                   onClick={() => setShowFullAcct(!showFullAcct)}
                   className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 p-1 rounded-md"
                   title={showFullAcct ? "Hide Account" : "Show Full Account"}
                >
                  {showFullAcct ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="font-mono font-bold text-gray-800 dark:text-gray-200 text-sm tracking-wider">
                {showFullAcct ? user.accountNumber : maskAccount(user.accountNumber)}
              </p>
            </div>

            {/* Balance Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Banknote size={12} /> Current Balance
                </div>
                {isLoadingBalance && (
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </div>
              <p className="font-black text-blue-800 dark:text-blue-300 text-xl tracking-tight">
                ₹{user.balance !== undefined ? Number(user.balance).toLocaleString('en-IN') : '---'}
              </p>
            </div>

            <hr className="border-gray-100 dark:border-slate-700" />

            {/* Actions */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-sm transition-all"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
