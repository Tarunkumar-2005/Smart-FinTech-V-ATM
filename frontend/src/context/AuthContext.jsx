import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read from localStorage for persistent login across tabs / sessions
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (accountNumber, pin, name) => {
    // If pin is empty and name is provided, the backend will attempt alternative auth
    const { data } = await API.post('/auth/login', { accountNumber, pin, name });
    const u = data.data;
    localStorage.setItem('token', u.token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return data;
  };

  const register = async (name, phone, address) => {
    const payload = { name };
    if (phone && phone.trim()) payload.phone = phone.trim();
    if (address && address.trim()) payload.address = address.trim();
    const { data } = await API.post('/auth/register', payload);
    const u = data.data;
    localStorage.setItem('token', u.token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateBalance = (balance) => {
    if (user) {
      const updated = { ...user, balance };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const updateUser = (updates) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateBalance, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
