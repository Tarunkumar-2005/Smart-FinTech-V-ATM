import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import ATMPage from './pages/ATMPage';
import Training from './pages/Training';
import TrainingModePage from './pages/TrainingModePage';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import QuizPage from './pages/QuizPage';
import Chatbot from './components/Chatbot';
import CalculatorPage from './pages/CalculatorPage';
import FraudLearning from './pages/FraudLearning';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1e3a5f',
              color: '#e2e8f0',
              border: '1px solid #2563eb44',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
          }}
        />
        <Chatbot />
        <Routes>
          {/* Public & guest routes */}
          <Route path="/training"      element={<Training />} />
          <Route path="/training-mode" element={<TrainingModePage />} />

          {/* Unified dashboard — handles auth internally */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Protected user routes */}
          <Route path="/atm" element={<ProtectedRoute><ATMPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><CalculatorPage /></ProtectedRoute>} />
          <Route path="/fraud-awareness" element={<ProtectedRoute><FraudLearning /></ProtectedRoute>} />

          {/* Protected admin routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

          {/* Legacy login/register → redirect to dashboard */}
          <Route path="/login"    element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />

          {/* Default */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
