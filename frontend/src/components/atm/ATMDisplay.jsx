export default function ATMDisplay({ children, className = '' }) {
  return (
    <div
      className={`bg-[#064e3b] rounded-xl p-6 min-h-[160px] md:min-h-[180px] border-2 border-emerald-900/60 flex flex-col justify-center ${className}`}
    >
      <div className="text-emerald-100 font-mono text-base md:text-lg leading-relaxed">
        {children}
      </div>
    </div>
  );
}
