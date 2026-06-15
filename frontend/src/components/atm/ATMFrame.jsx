export default function ATMFrame({ children, className = '' }) {
  return (
    <div className={`min-h-screen bg-slate-950 flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-2xl rounded-[2rem] bg-gradient-to-b from-slate-600 to-slate-800 shadow-2xl overflow-hidden border-4 border-slate-500">
        <div className="p-4 md:p-6 bg-slate-700/50 border-b-2 border-slate-600">
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 font-mono text-sm font-semibold tracking-wider">SMART ATM</span>
            <span className="text-slate-400 font-mono text-xs">SIMULATOR</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
