// Reusable Dashboard Card

export default function DashboardCard({ children, className = '', noPadding = false }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-blue-50 dark:border-slate-700/50 ${noPadding ? '' : 'p-6'} ${className}`}
    >
      {children}
    </div>
  );
}
