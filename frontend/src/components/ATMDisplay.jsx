import React from 'react';

const translations = {
  EN: {
    welcomeTitle: "WELCOME",
    welcomeSub: "SMART BANK",
    insertCard: "Please insert your card",
    readingCard: "Reading Card...",
    doNotRemove: "Please do not remove your card",
    selectLang: "Select Language",
    useButtons: "Use screen buttons or physical side buttons",
    enterPin: "Please Enter Your PIN",
    pressEnter: "Press ENTER to confirm",
    enterWithdrawal: "Enter Withdrawal Amount",
    newPinCurrent: "Enter Current PIN",
    newPinNew: "Enter New 4-Digit PIN",
    newPinConfirm: "Confirm New PIN",
    balance: "Available Balance",
    pressCancel: "Press CANCEL to return",
    statement: "Mini Statement",
    processing: "Processing...",
    transactionSuccess: "Transaction Successful",
    takeCard: "Returning to Main Menu...",
    dispensing: "Please wait while your cash is being dispensed",
    collectCash: "Please collect your cash",
    setPinRequired: "Please set your PIN to continue",
    setPinAccNum: "Enter 10-Digit Account Number",
    setPinBtn: "Set PIN"
  },
  HI: {
    welcomeTitle: "स्वागत है",
    welcomeSub: "स्मार्ट बैंक",
    insertCard: "कृपया अपना कार्ड डालें",
    readingCard: "कार्ड पढ़ रहा है...",
    doNotRemove: "कृपया अपना कार्ड न निकालें",
    selectLang: "भाषा चुनें",
    useButtons: "स्क्रीन बटन या भौतिक साइड बटन का उपयोग करें",
    enterPin: "कृपया अपना पिन दर्ज करें",
    pressEnter: "पुष्टि करने के लिए ENTER दबाएं",
    enterWithdrawal: "निकासी राशि दर्ज करें",
    newPinCurrent: "वर्तमान पिन दर्ज करें",
    newPinNew: "नया 4-अंकीय पिन दर्ज करें",
    newPinConfirm: "नए पिन की पुष्टि करें",
    balance: "उपलब्ध शेष राशि",
    pressCancel: "लौटने के लिए CANCEL दबाएं",
    statement: "मिनी स्टेटमेंट",
    processing: "प्रसंस्करण...",
    transactionSuccess: "लेनदेन सफल",
    takeCard: "विस्तृत मेनू पर लौट रहा है...",
    dispensing: "कृपया प्रतीक्षा करें जब तक आपकी नकदी निकाली जा रही है",
    collectCash: "कृपया अपनी नकदी एकत्र करें",
    setPinRequired: "जारी रखने के लिए कृपया अपना पिन सेट करें",
    setPinAccNum: "10-अंकीय खाता संख्या दर्ज करें",
    setPinBtn: "पिन सेट करें"
  }
};

const ATMMenu = ({ onScreenAction, lang }) => {
  const t = {
    EN: { w: 'Withdraw', s: 'Statement', p: 'PIN Change', b: 'Balance', e: 'Eject Card', t: 'Select Transaction' },
    HI: { w: 'निकासी', s: 'स्टेटमेंट', p: 'पिन बदलें', b: 'शेष राशि', e: 'कार्ड निकालें', t: 'लेनदेन चुनें' }
  }[lang] || { w: 'Withdraw', s: 'Statement', p: 'PIN Change', b: 'Balance', e: 'Eject Card', t: 'Select Transaction' };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative z-[10]">
      <h1 className="text-xl font-bold mb-4 border-b pb-2 border-green-800/50 w-3/4 text-center">{t.t}</h1>
      <div className="flex w-full justify-between items-center px-1 h-full text-lg mt-2 relative">
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-green-900/30 -translate-x-1/2 rounded-full"></div>
        
        <div className="flex flex-col justify-between h-full py-2 text-left space-y-4 flex-1 pr-2">
          <div className="cursor-pointer hover:bg-[#bbf7d0] hover:text-[#064e3b] px-3 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95 flex items-center group font-semibold" onClick={() => onScreenAction('L1')}>
              <span className="opacity-50 mr-2 group-hover:opacity-100">&lt;</span> {t.w}
          </div>
          <div className="cursor-pointer hover:bg-[#bbf7d0] hover:text-[#064e3b] px-3 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95 flex items-center group font-semibold" onClick={() => onScreenAction('L2')}>
              <span className="opacity-50 mr-2 group-hover:opacity-100">&lt;</span> {t.s}
          </div>
          <div className="cursor-pointer hover:bg-[#bbf7d0] hover:text-[#064e3b] px-3 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95 flex items-center group font-semibold" onClick={() => onScreenAction('L3')}>
              <span className="opacity-50 mr-2 group-hover:opacity-100">&lt;</span> {t.p}
          </div>
        </div>
        
        <div className="flex flex-col justify-between h-full py-2 text-right space-y-4 flex-1 pl-2">
          <div className="cursor-pointer hover:bg-[#bbf7d0] hover:text-[#064e3b] px-3 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-end group font-semibold" onClick={() => onScreenAction('R1')}>
              {t.b} <span className="opacity-50 ml-2 group-hover:opacity-100">&gt;</span>
          </div>
          <div className="mt-auto"></div>
          <div className="cursor-pointer hover:bg-red-200 hover:text-red-900 px-3 py-1.5 rounded transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-end group font-bold border border-transparent hover:border-red-400 text-red-100" onClick={() => onScreenAction('R2')}>
              {t.e} <span className="opacity-50 ml-2 group-hover:opacity-100">&gt;</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ATMDisplay = ({ currentScreen, pinInput, amountInput, message, onScreenAction, balance, transactions, language }) => {
  const t = translations[language] || translations['EN'];

  return (
    <div className="bg-gradient-to-b from-[#064e3b] to-[#022c22] text-[#bbf7d0] font-mono h-[280px] rounded-md shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] p-6 flex flex-col justify-center items-center relative overflow-hidden border-8 border-gray-900 w-full z-[10]">
      <div className="absolute top-2 left-2 text-[10px] opacity-40 pointer-events-none font-sans">SMART ATM OS v3.0</div>
      
      {/* Screen CRT scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-[20] pointer-events-none opacity-30"></div>

      <div className="flex flex-col items-center justify-center w-full h-full text-center relative z-[30]">
        
        {currentScreen === 'WELCOME' && (
          <div className="space-y-6 flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold tracking-wider drop-shadow-[0_0_15px_rgba(187,247,208,0.8)]">{t.welcomeTitle}</h1>
            <h2 className="text-xl font-semibold opacity-90 drop-shadow">{t.welcomeSub}</h2>
            <div className="mt-8 animate-pulse text-yellow-300 font-bold bg-yellow-900/30 px-6 py-2 rounded-lg border border-yellow-700/50 shadow-[0_0_15px_rgba(253,224,71,0.2)]">
               {t.insertCard}
            </div>
          </div>
        )}

        {currentScreen === 'READING_CARD' && (
          <div className="space-y-6 flex flex-col items-center justify-center h-full animate-pulse">
            <h1 className="text-3xl font-bold tracking-wider drop-shadow-[0_0_15px_rgba(187,247,208,0.8)]">{t.readingCard}</h1>
            <p className="text-xl text-yellow-300">{t.doNotRemove}</p>
          </div>
        )}

        {currentScreen === 'LANGUAGE' && (
          <div className="space-y-8 w-full flex flex-col justify-center h-full">
            <h1 className="text-2xl font-bold mb-4">{t.selectLang}</h1>
            <div className="flex justify-between w-full px-4 gap-6 relative">
              <button 
                onClick={() => onScreenAction('LANG_ENGLISH')}
                className="border-2 border-[#bbf7d0] px-4 py-3 rounded hover:bg-[#bbf7d0] hover:text-[#064e3b] font-bold transition-all duration-200 flex-1 shadow-[0_0_10px_rgba(187,247,208,0.2)] relative active:scale-95 text-lg"
              >
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-70 text-xl font-bold drop-shadow-md">&lt;</div>
                ENGLISH
              </button>
              <button 
                onClick={() => onScreenAction('LANG_HINDI')}
                className="border-2 border-[#bbf7d0] px-4 py-3 rounded hover:bg-[#bbf7d0] hover:text-[#064e3b] font-bold transition-all duration-200 flex-1 shadow-[0_0_10px_rgba(187,247,208,0.2)] relative active:scale-95 text-lg"
              >
                HINDI
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-70 text-xl font-bold drop-shadow-md">&gt;</div>
              </button>
            </div>
            <p className="text-sm mt-4 opacity-75 font-sans">{t.useButtons}</p>
          </div>
        )}

        {(currentScreen === 'PIN' || currentScreen === 'TRANSACTION_PIN') && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{t.enterPin}</h1>
            <div className="text-5xl tracking-[0.5em] mt-6 bg-black/30 py-3 rounded border border-green-900 shadow-inner">
              {pinInput.padEnd(4, '_').replace(/./g, (c, i) => (c === '_' ? '_' : '*'))}
            </div>
            <p className="text-red-400 mt-4 min-h-[20px] font-bold drop-shadow">{message}</p>
            <p className="text-sm mt-2 opacity-80">{t.pressEnter}</p>
          </div>
        )}

        {currentScreen === 'SET_PIN_REQUIRED' && (
          <div className="space-y-8 w-full flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold tracking-wider text-yellow-300 drop-shadow">{t.setPinRequired}</h1>
            <div className="flex justify-center w-full mt-4">
              <button 
                onClick={() => onScreenAction('START_SET_PIN')}
                className="border-2 border-yellow-400 text-yellow-100 px-8 py-3 rounded hover:bg-yellow-400 hover:text-black font-bold transition-all duration-200 shadow-[0_0_15px_rgba(250,204,21,0.3)] active:scale-95 text-xl flex items-center justify-center gap-3 animate-pulse"
              >
                {t.setPinBtn} &gt;
              </button>
            </div>
            <p className="text-red-400 mt-4 min-h-[20px] font-bold drop-shadow text-sm">{message}</p>
          </div>
        )}

        {currentScreen === 'SET_PIN_ENTER_ACC' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold">{t.setPinAccNum}</h1>
            <div className="text-3xl tracking-[0.2em] mt-6 bg-black/30 py-3 rounded border border-yellow-700 shadow-inner text-yellow-200">
              {amountInput || '_'}
            </div>
            <p className="text-red-400 mt-4 min-h-[20px] font-bold drop-shadow text-xs">{message}</p>
            <p className="text-sm mt-2 opacity-80">{t.pressEnter}</p>
          </div>
        )}

        {currentScreen === 'MENU' && (
          <ATMMenu onScreenAction={onScreenAction} lang={language} />
        )}

        {currentScreen === 'WITHDRAW_AMOUNT' && (
          <div className="space-y-6 w-full">
            <h1 className="text-2xl font-bold">{t.enterWithdrawal}</h1>
            <div className="text-4xl mt-6 bg-black/30 py-3 rounded border border-green-900 shadow-inner">
              ₹ {amountInput || '0'}
            </div>
            <p className="text-red-400 mt-4 min-h-[24px] font-bold drop-shadow">{message}</p>
            <p className="text-sm mt-2 opacity-80">{t.pressEnter}</p>
          </div>
        )}

        {currentScreen === 'CHANGE_PIN_CURRENT' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-yellow-300">{message || t.newPinCurrent}</h1>
            <div className="text-5xl tracking-[0.5em] mt-6 bg-black/30 py-3 rounded border border-green-900 shadow-inner">
              {pinInput.padEnd(4, '_').replace(/./g, (c, i) => (c === '_' ? '_' : '*'))}
            </div>
            <p className="text-sm mt-6 opacity-80">{t.pressEnter}</p>
          </div>
        )}

        {currentScreen === 'CHANGE_PIN_NEW' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">{message || t.newPinNew}</h1>
            <div className="text-5xl tracking-[0.5em] mt-6 bg-black/30 py-3 rounded border border-blue-900 shadow-inner">
              {pinInput.padEnd(4, '_').replace(/./g, (c, i) => (c === '_' ? '_' : '*'))}
            </div>
            <p className="text-sm mt-6 opacity-80">{t.pressEnter}</p>
          </div>
        )}

        {currentScreen === 'CHANGE_PIN_CONFIRM' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">{message || t.newPinConfirm}</h1>
            <div className="text-5xl tracking-[0.5em] mt-6 bg-black/30 py-3 rounded border border-purple-900 shadow-inner">
              {pinInput.padEnd(4, '_').replace(/./g, (c, i) => (c === '_' ? '_' : '*'))}
            </div>
            <p className="text-sm mt-6 opacity-80">{t.pressEnter}</p>
          </div>
        )}

        {currentScreen === 'BALANCE' && (
          <div className="space-y-6 w-full flex flex-col justify-center items-center h-full">
            <h1 className="text-2xl font-bold opacity-90">{t.balance}</h1>
            <div className="text-5xl mt-6 font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
              ₹ {balance.toFixed(2)}
            </div>
            <p className="text-sm mt-10 opacity-70">{t.pressCancel}</p>
          </div>
        )}

        {currentScreen === 'STATEMENT' && (
          <div className="w-full h-full flex flex-col justify-start pt-2">
            <h1 className="text-xl font-bold mb-3 text-center border-b pb-2 border-green-800/60 sticky top-0 bg-[#064e3b]/90 backdrop-blur-sm z-10 w-3/4 mx-auto">{t.statement}</h1>
            <div className="text-sm space-y-3 flex-grow overflow-auto mx-4 pr-2 scrollbar-thin scrollbar-thumb-green-700 scrollbar-track-transparent">
              {transactions.map((tx, idx) => (
                <div key={idx} className="flex justify-between border-b pb-2 border-green-900/50 font-mono">
                  <span className="opacity-70">{tx.date}</span>
                  <span className="flex-1 text-left ml-4 truncate">{tx.desc}</span>
                  <span className={`font-bold ${tx.type === 'dr' ? 'text-red-400' : 'text-green-300'}`}>
                    {tx.type === 'dr' ? '-' : '+'}₹{tx.amount}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs pt-3 text-center opacity-70 border-t border-green-900/50 mt-2">{t.pressCancel}</p>
          </div>
        )}

        {currentScreen === 'PROCESSING' && (
          <div className="space-y-6 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-green-900 border-t-[#bbf7d0] rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold tracking-widest mt-4">{t.processing}</h1>
          </div>
        )}

        {currentScreen === 'DISPENSING' && (
          <div className="space-y-6 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-yellow-600 border-t-yellow-300 rounded-full animate-spin shadow-[0_0_15px_rgba(253,224,71,0.4)]"></div>
            <h1 className="text-2xl font-bold tracking-widest mt-4 text-yellow-300 drop-shadow">{message === 'collect' ? t.collectCash : t.dispensing}</h1>
          </div>
        )}

        {currentScreen === 'SUCCESS' && (
          <div className="space-y-6 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-300 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow">{t.transactionSuccess}</h1>
            <p className="text-xl text-green-200 mt-2">{typeof message === 'string' && message.startsWith('Please collect') ? '' : message}</p>
            <p className="text-sm mt-8 opacity-75 font-sans animate-pulse text-yellow-300">{t.takeCard}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATMDisplay;
