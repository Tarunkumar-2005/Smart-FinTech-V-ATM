import { useEffect } from 'react';
import { useATMState, ATM_STATES } from '../../context/ATMStateContext';
import ATMDisplay from './ATMDisplay';
import ATMMenu from './ATMMenu';
import ATMKeypad from './ATMKeypad';

const WITHDRAW_OPTIONS = [
  { id: 500, label: '₹ 500' },
  { id: 1000, label: '₹ 1000' },
  { id: 2000, label: '₹ 2000' },
  { id: 5000, label: '₹ 5000' },
  { id: 'other', label: 'Other Amount', primary: true },
];

export default function ATMTransactionFlow() {
  const { state: atmState, dispatch, login, withdraw, deposit, fetchBalance, fetchTransactions } = useATMState();
  const { state, accountNumber, pin, pinAttempts, user, balance, transactions, withdrawAmount, depositAmount, lastError } = atmState;

  // When in ENTER_PIN and user submits, call login
  const handlePinSubmit = async () => {
    if (pin.length !== 4) return;
    const result = await login(accountNumber, pin);
    if (result.success) return;
    if (pinAttempts + 1 >= 3) {
      dispatch({ type: 'ACCOUNT_LOCKED' });
    } else {
      dispatch({ type: 'PIN_WRONG' });
    }
  };

  // Withdraw processing
  useEffect(() => {
    if (state !== ATM_STATES.WITHDRAW_PROCESSING || !withdrawAmount) return;
    const run = async () => {
      await withdraw(Number(withdrawAmount));
    };
    run();
  }, [state, withdrawAmount, withdraw]);

  // Deposit processing
  useEffect(() => {
    if (state !== ATM_STATES.DEPOSIT_PROCESSING || !depositAmount) return;
    const run = async () => {
      await deposit(Number(depositAmount));
    };
    run();
  }, [state, depositAmount, deposit]);

  const lang = atmState.language;

  useEffect(() => {
    if (state !== ATM_STATES.MINI_STATEMENT || !user) return;
    let cancelled = false;
    fetchTransactions().then((list) => {
      if (!cancelled) dispatch({ type: 'SET_TRANSACTIONS', payload: list });
    });
    return () => { cancelled = true; };
  }, [state, user, fetchTransactions, dispatch]);

  useEffect(() => {
    if (state !== ATM_STATES.BALANCE || !user) return;
    let cancelled = false;
    fetchBalance().then((b) => {
      if (!cancelled && b != null) dispatch({ type: 'UPDATE_BALANCE', payload: b });
    });
    return () => { cancelled = true; };
  }, [state, user, fetchBalance, dispatch]);
  const t = (en, hi, kn) => (lang === 'hi' ? hi : lang === 'kn' ? kn : en);

  if (state === ATM_STATES.WELCOME) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex gap-4 items-stretch">
          <div className="flex-1 min-w-0">
            <ATMDisplay>
              <p className="text-center text-xl md:text-2xl font-semibold mb-4">
                {t('Welcome to Smart ATM Simulator', 'स्मार्ट ATM सिम्युलेटर में आपका स्वागत है', 'ಸ್ಮಾರ್ಟ್ ATM ಸಿಮ್ಯುಲೇಟರ್ಗೆ ಸ್ವಾಗತ')}
              </p>
              <p className="text-center text-emerald-200/90">
                {t('Insert card to begin.', 'शुरू करने के लिए कार्ड डालें।', 'ಪ್ರಾರಂಭಿಸಲು ಕಾರ್ಡ್ ಸೇರಿಸಿ.')}
              </p>
            </ATMDisplay>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => dispatch({ type: 'INSERT_CARD' })}
            className="py-4 px-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-semibold text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.3)] active:scale-95 transition"
          >
            {t('Insert Card', 'कार्ड डालें', 'ಕಾರ್ಡ್ ಸೇರಿಸಿ')}
          </button>
        </div>
      </div>
    );
  }

  if (state === ATM_STATES.LANGUAGE) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center font-semibold mb-2">
            {t('Please select your language', 'कृपया अपनी भाषा चुनें', 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ')}
          </p>
        </ATMDisplay>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'en', label: 'English' },
            { id: 'hi', label: 'हिंदी' },
            { id: 'kn', label: 'ಕನ್ನಡ' },
          ].map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: l.id })}
              className="py-3 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-mono font-semibold shadow-[0_4px_0_0_rgba(0,0,0,0.25)] active:scale-95"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state === ATM_STATES.ACCOUNT_NUMBER) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center font-semibold mb-2">
            {t('Enter your 10-digit account number', 'अपना 10 अंकों का खाता नंबर दर्ज करें', 'ನಿಮ್ಮ 10 ಅಂಕಿಯ ಖಾತೆ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ')}
          </p>
        </ATMDisplay>
        <ATMKeypad
          value={accountNumber}
          onChange={(v) => dispatch({ type: 'SET_ACCOUNT_NUMBER', payload: v })}
          onSubmit={() => accountNumber.length === 10 && dispatch({ type: 'ACCOUNT_ENTER' })}
          maxLength={10}
        />
      </div>
    );
  }

  if (state === ATM_STATES.ENTER_PIN) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center font-semibold mb-2">
            {t('Please enter your 4-digit PIN', 'कृपया अपना 4 अंकों का PIN दर्ज करें', 'ದಯವಿಟ್ಟು ನಿಮ್ಮ 4 ಅಂಕಿಯ PIN ನಮೂದಿಸಿ')}
          </p>
        </ATMDisplay>
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <ATMKeypad
              value={pin}
              onChange={(v) => dispatch({ type: 'SET_PIN', payload: v })}
              onSubmit={pin.length === 4 ? handlePinSubmit : undefined}
              masked
              maxLength={4}
            />
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET' })}
            className="py-3 px-6 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-mono text-sm font-semibold shadow-[0_4px_0_0_rgba(0,0,0,0.25)] active:scale-95"
          >
            {t('Cancel', 'रद्द करें', 'ರದ್ದುಮಾಡಿ')}
          </button>
        </div>
      </div>
    );
  }

  if (state === ATM_STATES.PIN_WRONG) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center text-amber-300 font-semibold">{lastError}</p>
        </ATMDisplay>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: 'PIN_RETRY' })}
            className="py-3 px-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold"
          >
            {t('Try Again', 'पुनः प्रयास करें', 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ')}
          </button>
        </div>
      </div>
    );
  }

  if (state === ATM_STATES.ACCOUNT_LOCKED) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center text-amber-300 font-semibold">
            {t('Account temporarily locked.', 'खाता अस्थायी रूप से लॉक है।', 'ಖಾತೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಾಕ್ ಆಗಿದೆ.')}
          </p>
        </ATMDisplay>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET' })}
            className="py-3 px-8 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-mono font-semibold"
          >
            {t('Start Over', 'फिर से शुरू करें', 'ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ')}
          </button>
        </div>
      </div>
    );
  }

  if (state === ATM_STATES.MENU) {
    const menuOptions = [
      { id: ATM_STATES.WITHDRAW_AMOUNT, label: t('Withdraw Cash', 'नकद निकालें', 'ನಗದು ಹಿಂಪಡಿಯಿರಿ'), primary: true },
      { id: ATM_STATES.DEPOSIT_AMOUNT, label: t('Deposit', 'जमा करें', 'ಠೇವಣಿ'), primary: false },
      { id: ATM_STATES.BALANCE, label: t('Balance Inquiry', 'बैलेंस पूछताछ', 'ಬ್ಯಾಲೆನ್ಸ್ ವಿಚಾರಣೆ'), primary: false },
      { id: ATM_STATES.MINI_STATEMENT, label: t('Mini Statement', 'मिनी स्टेटमेंट', 'ಮಿನಿ ಸ್ಟೇಟ್ಮೆಂಟ್'), primary: false },
      { id: ATM_STATES.CHANGE_PIN, label: t('Change PIN', 'PIN बदलें', 'PIN ಬದಲಾಯಿಸಿ'), primary: false },
      { id: ATM_STATES.EXIT, label: t('Exit', 'बाहर निकलें', 'ನಿರ್ಗಮನ'), primary: false },
    ];
    return (
      <div className="p-4 md:p-6 flex gap-4 items-stretch">
        <div className="w-28 md:w-32 flex-shrink-0">
          <ATMMenu options={menuOptions} onSelect={(id) => dispatch({ type: 'MENU_SELECT', payload: id })} />
        </div>
        <div className="flex-1 min-w-0">
          <ATMDisplay>
            <p className="text-center font-semibold">
              {t('Select Transaction', 'लेनदेन चुनें', 'ವಹಿವಾಟು ಆಯ್ಕೆಮಾಡಿ')}
            </p>
          </ATMDisplay>
        </div>
        <div className="w-28 md:w-32 flex-shrink-0" />
      </div>
    );
  }

  if (state === ATM_STATES.WITHDRAW_AMOUNT) {
    return (
      <div className="p-4 md:p-6 flex gap-4 items-stretch">
        <div className="w-28 flex-shrink-0">
          <ATMMenu
            options={WITHDRAW_OPTIONS.map((o) => ({ ...o, label: o.label }))}
            onSelect={(id) => {
              if (id === 'other') dispatch({ type: 'MENU_SELECT', payload: ATM_STATES.WITHDRAW_OTHER });
              else dispatch({ type: 'SET_WITHDRAW_AMOUNT', payload: id });
            }}
          />
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          <ATMDisplay>
            <p className="text-center font-semibold">{t('Select amount', 'राशि चुनें', 'ಮೊತ್ತ ಆಯ್ಕೆಮಾಡಿ')}</p>
          </ATMDisplay>
          <button
            type="button"
            onClick={() => dispatch({ type: 'CANCEL' })}
            className="w-full py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-mono text-sm"
          >
            {t('Cancel', 'रद्द करें', 'ರದ್ದುಮಾಡಿ')}
          </button>
        </div>
        <div className="w-28 flex-shrink-0" />
      </div>
    );
  }

  if (state === ATM_STATES.WITHDRAW_OTHER) {
    const withdrawInput = atmState.withdrawInput || '';
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center font-semibold">{t('Enter amount', 'राशि दर्ज करें', 'ಮೊತ್ತ ನಮೂದಿಸಿ')}</p>
        </ATMDisplay>
        <ATMKeypad
          value={withdrawInput}
          onChange={(v) => dispatch({ type: 'SET_WITHDRAW_INPUT', payload: v })}
          onSubmit={() => {
            const amt = Number(withdrawInput);
            if (amt > 0) dispatch({ type: 'SET_WITHDRAW_OTHER_AMOUNT', payload: amt });
          }}
          maxLength={7}
        />
        <button type="button" onClick={() => dispatch({ type: 'BACK_TO_MENU' })} className="w-full py-2 rounded-lg bg-slate-600 text-white font-mono text-sm">
          Cancel
        </button>
      </div>
    );
  }

  if (state === ATM_STATES.WITHDRAW_CONFIRM) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center font-semibold mb-2">{t('Do you want to proceed?', 'क्या आप आगे बढ़ना चाहते हैं?', 'ನೀವು ಮುಂದುವರಿಯಲು ಬಯಸುವಿರಾ?')}</p>
          <p className="text-center text-emerald-300 text-xl">₹ {Number(withdrawAmount).toLocaleString('en-IN')}</p>
        </ATMDisplay>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: 'WITHDRAW_CONFIRM' })}
            className="py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold"
          >
            {t('Confirm', 'पुष्टि करें', 'ದೃಢೀಕರಿಸಿ')}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'CANCEL' })}
            className="py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-semibold"
          >
            {t('Cancel', 'रद्द करें', 'ರದ್ದುಮಾಡಿ')}
          </button>
        </div>
      </div>
    );
  }

  if (state === ATM_STATES.WITHDRAW_PROCESSING) {
    return (
      <div className="p-4 md:p-6">
        <ATMDisplay>
          <p className="text-center font-semibold text-emerald-300 animate-pulse">
            {t('Processing transaction...', 'लेनदेन संसाधित हो रहा है...', 'ವಹಿವಾಟು ಸಂಸ್ಕರಿಸಲಾಗುತ್ತಿದೆ...')}
          </p>
        </ATMDisplay>
      </div>
    );
  }

  if (state === ATM_STATES.WITHDRAW_SUCCESS) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center text-emerald-300 font-semibold mb-2">
            {t('Please collect your cash.', 'कृपया अपना नकद लें।', 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ನಗದು ಸಂಗ್ರಹಿಸಿ.')}
          </p>
          <p className="text-center text-xl">Balance: ₹ {Number(atmState.balance).toLocaleString('en-IN')}</p>
        </ATMDisplay>
        <button
          type="button"
          onClick={() => dispatch({ type: 'ANOTHER_YES' })}
          className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold"
        >
          {t('Another transaction', 'जारी रखें', 'ಮುಂದುವರಿಸಿ')}
        </button>
      </div>
    );
  }

  if (state === ATM_STATES.DEPOSIT_AMOUNT) {
    const depositInput = atmState.depositInput || '';
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center font-semibold">{t('Enter amount to deposit', 'जमा करने के लिए राशि दर्ज करें', 'ಠೇವಣಿ ಮೊತ್ತ ನಮೂದಿಸಿ')}</p>
        </ATMDisplay>
        <ATMKeypad
          value={depositInput}
          onChange={(v) => dispatch({ type: 'SET_DEPOSIT_INPUT', payload: v })}
          onSubmit={() => {
            const amt = Number(depositInput);
            if (amt > 0) dispatch({ type: 'SET_DEPOSIT_AMOUNT', payload: amt });
          }}
          maxLength={7}
        />
        <button type="button" onClick={() => dispatch({ type: 'CANCEL' })} className="w-full py-2 rounded-lg bg-slate-600 text-white font-mono text-sm">
          Cancel
        </button>
      </div>
    );
  }

  if (state === ATM_STATES.DEPOSIT_CONFIRM) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center font-semibold mb-2">{t('Do you want to proceed?', 'क्या आप आगे बढ़ना चाहते हैं?', 'ನೀವು ಮುಂದುವರಿಯಲು ಬಯಸುವಿರಾ?')}</p>
          <p className="text-center text-emerald-300 text-xl">₹ {Number(depositAmount).toLocaleString('en-IN')}</p>
        </ATMDisplay>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => dispatch({ type: 'DEPOSIT_CONFIRM' })} className="py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold">
            Confirm
          </button>
          <button type="button" onClick={() => dispatch({ type: 'CANCEL' })} className="py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-semibold">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (state === ATM_STATES.DEPOSIT_PROCESSING) {
    return (
      <div className="p-4 md:p-6">
        <ATMDisplay>
          <p className="text-center font-semibold text-emerald-300 animate-pulse">Processing transaction...</p>
        </ATMDisplay>
      </div>
    );
  }

  if (state === ATM_STATES.DEPOSIT_SUCCESS) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center text-emerald-300 font-semibold mb-2">Deposit successful.</p>
          <p className="text-center text-xl">Balance: ₹ {Number(atmState.balance).toLocaleString('en-IN')}</p>
        </ATMDisplay>
        <button type="button" onClick={() => dispatch({ type: 'ANOTHER_YES' })} className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold">
          Another transaction
        </button>
      </div>
    );
  }

  if (state === ATM_STATES.BALANCE) {
    const bal = user?.balance ?? balance;
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center font-semibold mb-2">{t('Account Balance', 'खाता शेष', 'ಖಾತೆ ಬ್ಯಾಲೆನ್ಸ್')}</p>
          <p className="text-center text-2xl text-emerald-300">₹ {Number(bal).toLocaleString('en-IN')}</p>
        </ATMDisplay>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: 'BALANCE_DONE' })}
            className="py-3 rounded-lg bg-slate-500 hover:bg-slate-400 text-white font-mono text-sm"
          >
            {t('Print Receipt', 'रसीद छापें', 'ರಸೀದಿ ಮುದ್ರಿಸಿ')}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'BACK_TO_MENU' })}
            className="py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-sm"
          >
            {t('Back to Menu', 'मेनू पर वापस', 'ಮೆನುಗೆ ಹಿಂತಿರುಗಿ')}
          </button>
        </div>
      </div>
    );
  }

  if (state === ATM_STATES.MINI_STATEMENT) {
    const list = transactions || [];
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <div className="space-y-1 text-sm">
            <p className="font-semibold mb-2">{t('Last 5 transactions', 'पिछले 5 लेनदेन', 'ಕೊನೆಯ 5 ವಹಿವಾಟುಗಳು')}</p>
            {list.length === 0 ? (
              <p className="text-emerald-200/80">Loading...</p>
            ) : (
              list.map((tx, i) => (
                <div key={i} className="flex justify-between">
                  <span>{tx.type === 'deposit' ? '+' : '-'} ₹{tx.amount}</span>
                  <span>₹{tx.balanceAfter}</span>
                </div>
              ))
            )}
          </div>
        </ATMDisplay>
        <button
          type="button"
          onClick={() => dispatch({ type: 'STATEMENT_DONE' })}
          className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold"
        >
          {t('Back to Menu', 'मेनू पर वापस', 'ಮೆನುಗೆ ಹಿಂತಿರುಗಿ')}
        </button>
      </div>
    );
  }

  if (state === ATM_STATES.ANOTHER_TRANSACTION) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center font-semibold">
            {t('Would you like another transaction?', 'क्या आप कोई और लेनदेन करना चाहेंगे?', 'ನೀವು ಇನ್ನೊಂದು ವಹಿವಾಟು ಮಾಡಲು ಬಯಸುವಿರಾ?')}
          </p>
        </ATMDisplay>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => dispatch({ type: 'ANOTHER_YES' })} className="py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-semibold">
            Yes
          </button>
          <button type="button" onClick={() => dispatch({ type: 'ANOTHER_NO' })} className="py-3 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-mono font-semibold">
            No
          </button>
        </div>
      </div>
    );
  }

  if (state === ATM_STATES.CHANGE_PIN) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center text-emerald-200/90">{t('Change PIN — Coming soon.', 'PIN बदलें — जल्द ही।', 'PIN ಬದಲಾಯಿಸಿ — ಶೀಘ್ರದಲ್ಲೇ.')}</p>
        </ATMDisplay>
        <button
          type="button"
          onClick={() => dispatch({ type: 'BACK_TO_MENU' })}
          className="w-full py-3 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-mono font-semibold"
        >
          {t('Back to Menu', 'मेनू पर वापस', 'ಮೆನುಗೆ ಹಿಂತಿರುಗಿ')}
        </button>
      </div>
    );
  }

  if (state === ATM_STATES.EXIT) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <ATMDisplay>
          <p className="text-center text-emerald-300 font-semibold mb-2">
            {t('Please collect your card.', 'कृपया अपना कार्ड लें।', 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಕಾರ್ಡ್ ಸಂಗ್ರಹಿಸಿ.')}
          </p>
          <p className="text-center">{t('Thank you for using Smart ATM.', 'Smart ATM उपयोग करने के लिए धन्यवाद।', 'ಸ್ಮಾರ್ಟ್ ATM ಬಳಸಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು.')}</p>
        </ATMDisplay>
        <button
          type="button"
          onClick={() => { dispatch({ type: 'RESET' }); localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }}
          className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-mono font-semibold"
        >
          {t('Done', 'समाप्त', 'ಮುಗಿದಿದೆ')}
        </button>
      </div>
    );
  }

  return null;
}
