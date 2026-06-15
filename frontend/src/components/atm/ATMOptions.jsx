export default function ATMOptions({ side, onWithdraw, onMiniStatement, onDeposit, onBalance, disabled }) {
  const btnClass =
    'w-full py-3 px-4 rounded-lg font-mono text-sm font-semibold transition-all duration-150 ' +
    'shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_0_rgba(0,0,0,0.2)] hover:translate-y-0.5 ' +
    'active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_0_rgba(0,0,0,0.2)]';

  const wrapperClass = 'flex flex-col gap-3 w-24 md:w-28 flex-shrink-0';

  if (side === 'left') {
    return (
      <div className={wrapperClass}>
        <button
          type="button"
          onClick={onWithdraw}
          disabled={disabled}
          className={`${btnClass} bg-amber-600 hover:bg-amber-500 text-white`}
        >
          Withdraw
        </button>
        <button
          type="button"
          onClick={onMiniStatement}
          disabled={disabled}
          className={`${btnClass} bg-amber-600 hover:bg-amber-500 text-white`}
        >
          Mini Statement
        </button>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        onClick={onDeposit}
        disabled={disabled}
        className={`${btnClass} bg-emerald-600 hover:bg-emerald-500 text-white`}
      >
        Deposit
      </button>
      <button
        type="button"
        onClick={onBalance}
        disabled={disabled}
        className={`${btnClass} bg-emerald-600 hover:bg-emerald-500 text-white`}
      >
        Balance
      </button>
    </div>
  );
}
