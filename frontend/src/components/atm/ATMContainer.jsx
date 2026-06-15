export default function ATMContainer({ children }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-700 shadow-2xl overflow-hidden border-4 border-slate-600">
        {children}
      </div>
    </div>
  );
}
