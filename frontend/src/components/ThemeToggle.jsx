import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? (
        <Sun size={18} className="text-amber-400 drop-shadow-sm" />
      ) : (
        <Moon size={18} className="text-indigo-600 drop-shadow-sm" />
      )}
    </button>
  );
}
