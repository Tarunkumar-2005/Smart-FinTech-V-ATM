import React, { useState, useEffect } from 'react';
import ATMDisplay from './ATMDisplay';
import ATMSideButtons from './ATMSideButtons';
import ATMKeypad from './ATMKeypad';
import CardSlot from './CardSlot';
import CashSlot from './CashSlot';
import API from '../api/axios'; // Make sure to import the configured Axios instance
import { useAuth } from '../context/AuthContext';

const ATMFrame = ({ user, isCardInserted, onCardInsert, onCardEject }) => {
  const [currentScreen, setCurrentScreen] = useState('WELCOME');
  const [language, setLanguage] = useState('EN');
  const [pinInput, setPinInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [message, setMessage] = useState('');
  const [dispenseAmount, setDispenseAmount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pinChangeStore, setPinChangeStore] = useState({ current: '', new: '' });
  const [pendingAction, setPendingAction] = useState(null);
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  // Expose the global user context updater if available
  const { updateUser } = useAuth();

  // Keep balance synced if user context updates from App
  useEffect(() => {
    if (user && user.balance !== undefined) {
      setBalance(user.balance);
    }
  }, [user]);

  useEffect(() => {
    if (currentScreen === 'SUCCESS') {
      const timer = setTimeout(() => {
        setCurrentScreen('MENU');
        setPinInput('');
        setAmountInput('');
        setMessage('');
        setDispenseAmount(0);
        // Do NOT eject card automatically, allow multiple transactions
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const addTransaction = (desc, amount, type) => {
    const today = new Date().toISOString().split('T')[0];
    const newTx = { date: today, desc, amount, type };
    setTransactions(prev => [newTx, ...prev].slice(0, 5));
  };

  const handleKeyClick = (key) => {
    if (['PIN', 'TRANSACTION_PIN', 'CHANGE_PIN_CURRENT', 'CHANGE_PIN_NEW', 'CHANGE_PIN_CONFIRM'].includes(currentScreen)) {
      if (pinInput.length < 4) setPinInput((prev) => prev + key);
    } else if (['WITHDRAW_AMOUNT', 'SET_PIN_ENTER_ACC'].includes(currentScreen)) {
      setAmountInput((prev) => prev + key);
    }
  };

  const processTransaction = async (type) => {
    setCurrentScreen('PROCESSING');
    
    if (type === 'WITHDRAW') {
        const amt = parseFloat(amountInput);
        if (isNaN(amt) || amt <= 0) {
            setMessage(language === 'HI' ? 'अमान्य राशि' : 'Invalid amount');
            setCurrentScreen('WITHDRAW_AMOUNT');
            return;
        }
        if (amt % 500 !== 0) {
            setMessage(language === 'HI' ? 'कृपया 500 के गुणकों में राशि दर्ज करें' : 'Please enter amount in multiples of 500');
            setCurrentScreen('WITHDRAW_AMOUNT');
            return;
        }

        try {
            await new Promise(r => setTimeout(r, 600)); // Synthetic ATM processing lag
            
            // Post Secure Withdrawal
            const res = await API.post('/account/withdraw', { amount: amt });
            setBalance(res.data.data.balance);
            setDispenseAmount(amt);
            
            // Update Mini Statement
            const txRes = await API.get('/account/transactions?limit=5');
            const mappedTxs = (txRes.data.data || []).map(tx => ({
                date: new Date(tx.createdAt).toISOString().split('T')[0],
                desc: tx.type.toUpperCase(),
                amount: tx.amount,
                type: tx.type === 'withdraw' ? 'dr' : 'cr'
            }));
            setTransactions(mappedTxs);
            
            setCurrentScreen('DISPENSING');
            setMessage(''); 
            
            setTimeout(() => {
               setMessage('collect'); 
               setTimeout(() => {
                  setCurrentScreen('SUCCESS');
               }, 2500); 
            }, 1500); 
            
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Network Error or Insufficient Funds.';
            setMessage(errorMsg);
            setCurrentScreen('WITHDRAW_AMOUNT');
        }
    } else if (type === 'PIN_CHANGE') {
        try {
            await new Promise(r => setTimeout(r, 600)); 
            await API.post('/account/change-pin', { 
                currentPin: pinChangeStore.current, 
                newPin: pinInput 
            });
            setMessage(language === 'HI' ? 'आपका पिन सफलतापूर्वक बदल दिया गया है' : 'Your PIN was successfully changed');
            setPinChangeStore({ current: '', new: '' });
            setCurrentScreen('SUCCESS');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Network Error';
            setMessage(errorMsg);
            setPinChangeStore({ current: '', new: '' });
            setPinInput('');
            setCurrentScreen('CHANGE_PIN_CURRENT');
        }
    } else if (type === 'SET_PIN') {
        try {
            await new Promise(r => setTimeout(r, 600)); 
            await API.post('/account/set-pin', { 
                accountNumber: user.accountNumber, 
                newPin: pinInput 
            });
            setMessage(language === 'HI' ? 'आपका पिन सफलतापूर्वक सेट हो गया है' : 'Your PIN was successfully set.');
            setPinChangeStore({ current: '', new: '' });
            setAmountInput('');
            
            // Globally update pinSet flag so Dashboard unlocks
            if (updateUser) updateUser({ pinSet: true });

            setCurrentScreen('SUCCESS');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Network Error';
            setMessage(errorMsg);
            setPinChangeStore({ current: '', new: '' });
            setPinInput('');
            setCurrentScreen('SET_PIN_ENTER_ACC');
        }
    }
  };

  const verifyCurrentPinForChange = async () => {
    if (!user || !user.accountNumber) return;
    setIsVerifying(true);
    setCurrentScreen('PROCESSING');
    try {
        await new Promise(r => setTimeout(r, 400));
        await API.post('/auth/login', { 
            accountNumber: user.accountNumber, 
            pin: pinInput 
        });
        setPinChangeStore({ current: pinInput, new: '' });
        setPinInput('');
        setMessage('');
        setCurrentScreen('CHANGE_PIN_NEW');
    } catch (err) {
        const errorMsg = err.response?.data?.message || 'Incorrect PIN. Please try again.';
        setMessage(errorMsg);
        setPinInput('');
        setCurrentScreen('CHANGE_PIN_CURRENT');
    } finally {
        setIsVerifying(false);
    }
  };

  const verifyTransactionPin = async () => {
    if (!user || !user.accountNumber) return;
    setIsVerifying(true);
    setCurrentScreen('PROCESSING');
    try {
        await new Promise(r => setTimeout(r, 400));
        await API.post('/auth/login', { 
            accountNumber: user.accountNumber, 
            pin: pinInput 
        });
        
        // Success
        setMessage('');
        setPinInput('');
        setCurrentScreen(pendingAction);
        
        if (pendingAction === 'BALANCE') {
            const balRes = await API.get('/account/balance');
            setBalance(balRes.data.data.balance);
        }
        setPendingAction(null);
    } catch (err) {
        const errorMsg = err.response?.data?.message || 'Incorrect PIN. Please try again.';
        setMessage(errorMsg);
        setPinInput('');
        setCurrentScreen('TRANSACTION_PIN'); // Allow retry on the requested screen
    } finally {
        setIsVerifying(false);
    }
  };

  const verifyPinBackend = async () => {
    if (!user || !user.accountNumber) {
        setMessage('Network Error: Missing User Context');
        setPinInput('');
        return;
    }
    
    setIsVerifying(true);
    setCurrentScreen('PROCESSING');

    try {
        await new Promise(r => setTimeout(r, 500)); 

        await API.post('/auth/login', { 
            accountNumber: user.accountNumber, 
            pin: pinInput 
        });
        
        const [balRes, txRes] = await Promise.all([
          API.get('/account/balance'),
          API.get('/account/transactions?limit=5')
        ]);
        
        const mappedTxs = (txRes.data.data || []).map(tx => ({
            date: new Date(tx.createdAt).toISOString().split('T')[0],
            desc: tx.type.toUpperCase(),
            amount: tx.amount,
            type: tx.type === 'withdraw' ? 'dr' : 'cr'
        }));

        setBalance(balRes.data.data.balance);
        setTransactions(mappedTxs);

        // Mark pinAuthenticated progress step (silent)
        API.post('/account/progress', { step: 'pinAuthenticated' }).catch(() => {});

        // Success
        setMessage('');
        setCurrentScreen('MENU');
    } catch (err) {
        // Handle failed attempts and account locks returned by new backend logic
        const errorMsg = err.response?.data?.message || 'Verification Failed';
        setMessage(errorMsg);
        setPinInput('');
        setCurrentScreen('PIN'); // Return them to PIN screen to see the error message
    } finally {
        setIsVerifying(false);
    }
  };

  const handleActionClick = (action) => {
    if (isVerifying) return; // Prevent clicks while verifying backend
    setMessage('');
    
    if (action === 'CANCEL') {
      if (currentScreen === 'TRANSACTION_PIN') {
        setCurrentScreen('MENU');
        setPendingAction(null);
        setPinInput('');
        setMessage('');
      } else if (['PIN', 'LANGUAGE', 'SET_PIN_REQUIRED', 'SET_PIN_ENTER_ACC'].includes(currentScreen)) {
        setCurrentScreen('WELCOME');
        setLanguage('EN');
        setPendingAction(null);
        if (onCardEject) onCardEject();
      } else if (['BALANCE', 'STATEMENT', 'WITHDRAW_AMOUNT', 'CHANGE_PIN_CURRENT', 'CHANGE_PIN_NEW', 'CHANGE_PIN_CONFIRM'].includes(currentScreen)) {
        if (user && user.pinSet === false) {
           setCurrentScreen('WELCOME');
           if (onCardEject) onCardEject();
        } else {
           setCurrentScreen('MENU');
        }
      }
      setPinInput('');
      setAmountInput('');
      setPinChangeStore({ current: '', new: '' });
    } else if (action === 'CLEAR') {
      if (['PIN', 'TRANSACTION_PIN', 'CHANGE_PIN_CURRENT', 'CHANGE_PIN_NEW', 'CHANGE_PIN_CONFIRM'].includes(currentScreen)) setPinInput('');
      else if (['WITHDRAW_AMOUNT', 'SET_PIN_ENTER_ACC'].includes(currentScreen)) setAmountInput('');
    } else if (action === 'ENTER') {
      if (currentScreen === 'PIN') {
        if (pinInput.length === 4) {
           verifyPinBackend();
        } else {
           setMessage(language === 'HI' ? 'पिन 4 अंकों का होना चाहिए' : 'PIN must be 4 digits');
        }
      } else if (currentScreen === 'TRANSACTION_PIN') {
        if (pinInput.length === 4) {
           verifyTransactionPin();
        } else {
           setMessage(language === 'HI' ? 'पिन 4 अंकों का होना चाहिए' : 'PIN must be 4 digits');
        }
      } else if (currentScreen === 'WITHDRAW_AMOUNT') {
        if (amountInput.length > 0) processTransaction('WITHDRAW');
      } else if (currentScreen === 'CHANGE_PIN_CURRENT') {
        if (pinInput.length === 4) {
           verifyCurrentPinForChange();
        } else setMessage(language === 'HI' ? 'पिन 4 अंकों का होना चाहिए' : 'PIN must be 4 digits');
      } else if (currentScreen === 'CHANGE_PIN_NEW') {
        if (pinInput.length === 4) {
           if (pinInput === pinChangeStore.current) {
               setMessage(language === 'HI' ? 'नया पिन पुराने पिन के समान नहीं हो सकता' : 'New PIN cannot be same as old');
               setPinInput('');
           } else {
               setPinChangeStore(prev => ({ ...prev, new: pinInput }));
               setPinInput('');
               setMessage('');
               setCurrentScreen('CHANGE_PIN_CONFIRM');
           }
        } else setMessage(language === 'HI' ? 'पिन 4 अंकों का होना चाहिए' : 'PIN must be 4 digits');
      } else if (currentScreen === 'CHANGE_PIN_CONFIRM') {
        if (pinInput.length === 4) {
           if (pinInput !== pinChangeStore.new) {
               setMessage(language === 'HI' ? 'पिन मेल नहीं खाता' : 'PIN does not match');
               setPinChangeStore({ current: '', new: '' });
               setPinInput('');
               setCurrentScreen(user && user.pinSet === false ? 'CHANGE_PIN_NEW' : 'CHANGE_PIN_CURRENT');
           } else {
               if (user && user.pinSet === false) {
                   processTransaction('SET_PIN');
               } else {
                   processTransaction('PIN_CHANGE');
               }
           }
        } else setMessage(language === 'HI' ? 'पिन 4 अंकों का होना चाहिए' : 'PIN must be 4 digits');
      } else if (currentScreen === 'SET_PIN_ENTER_ACC') {
        if (amountInput === user?.accountNumber) {
           // Basic validation, backend confirms matched account
           setCurrentScreen('CHANGE_PIN_NEW');
           setPinInput('');
           setMessage('');
        } else setMessage(language === 'HI' ? 'अमान्य खाता संख्या' : 'Invalid Account Number');
      }
    }
  };

  const handleScreenAction = (action) => {
    if (isVerifying) return; // Ignore if loading

    if (action === 'LANG_ENGLISH') {
      setLanguage('EN');
      setCurrentScreen('PIN');
    } else if (action === 'LANG_HINDI') {
      setLanguage('HI');
      setCurrentScreen('PIN');
    } else if (currentScreen === 'MENU') {
      switch (action) {
        case 'L1': 
          setPendingAction('WITHDRAW_AMOUNT');
          setPinInput('');
          setCurrentScreen('TRANSACTION_PIN'); 
          break;
        case 'L2': setCurrentScreen('STATEMENT'); break;
        case 'L3':
          setMessage('');
          setPinInput('');
          setPinChangeStore({ current: '', new: '' });
          setCurrentScreen('CHANGE_PIN_CURRENT');
          break;
        case 'R1': 
          setPendingAction('BALANCE');
          setPinInput('');
          setCurrentScreen('TRANSACTION_PIN');
          break;
        case 'R2':
          setCurrentScreen('WELCOME');
          setLanguage('EN');
          if (onCardEject) onCardEject();
          break;
        default: break;
      }
    } else if (currentScreen === 'LANGUAGE') {
      if (action === 'L1') { setLanguage('EN'); setCurrentScreen('PIN'); }
      else if (action === 'R1') { setLanguage('HI'); setCurrentScreen('PIN'); }
    } else if (currentScreen === 'SET_PIN_REQUIRED') {
      if (action === 'START_SET_PIN') {
        setCurrentScreen('SET_PIN_ENTER_ACC');
        setAmountInput('');
        setPinInput('');
        setMessage('');
        setPinChangeStore({ current: '', new: '' });
      }
    }
  };

  const handleCardDrop = () => {
    if (currentScreen === 'WELCOME' && !isCardInserted) {
      if (onCardInsert) onCardInsert();
      setCurrentScreen('READING_CARD');
      // Mark progress step (silent — never breaks ATM flow)
      API.post('/account/progress', { step: 'cardInserted' }).catch(() => {});
      setTimeout(() => {
        if (user && user.pinSet === false) {
           setCurrentScreen('SET_PIN_REQUIRED');
        } else {
           setCurrentScreen('LANGUAGE');
        }
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-h-screen text-white font-sans drop-shadow-2xl">
      <div className="bg-gradient-to-b from-[#1f2937] to-[#111827] border-[12px] border-gray-700 rounded-3xl w-[95%] max-w-[1200px] p-4 sm:p-8 flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.9)] relative overflow-hidden ring-4 ring-black">
        
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] mix-blend-overlay"></div>

        {/* 2-Column Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(350px,400px)] gap-6 lg:gap-10 items-start relative z-10 w-full h-full">
            
            {/* Left Column: Screen + Buttons + Cash Slot underneath */}
            <div className="flex flex-col items-center w-full lg:border-r-2 lg:border-gray-600/30 lg:pr-8">
               {/* Top Grid: Buttons | Screen | Buttons */}
               <div className="grid grid-cols-[60px_1fr_60px] sm:grid-cols-[80px_1fr_80px] gap-2 items-center w-full relative z-10">
                  <ATMSideButtons side="left" onAction={handleScreenAction} />
                  <ATMDisplay 
                    currentScreen={currentScreen} 
                    pinInput={pinInput}
                    amountInput={amountInput}
                    message={message}
                    onScreenAction={handleScreenAction}
                    balance={balance}
                    transactions={transactions}
                    language={language}
                  />
                  <ATMSideButtons side="right" onAction={handleScreenAction} />
               </div>
               
               {/* Cash Slot / Receipt Printer Area moved strictly under Screen area on Left Side */}
               <div className="flex flex-col items-center mt-12 mb-4 w-full relative z-10">
                 <CashSlot 
                   isDispensing={currentScreen === 'DISPENSING' && message === 'collect'} 
                   amount={dispenseAmount} 
                   showCash={currentScreen === 'SUCCESS' && dispenseAmount > 0} 
                 />
               </div>
            </div>

            {/* Right Column: Card Slot on Top, Keypad Below */}
            <div className="flex flex-col items-center justify-start h-full lg:pl-4 w-full">
                
                {/* Card Slot */}
                <div className="w-full flex justify-center mb-10 pt-4">
                   <CardSlot onCardDrop={handleCardDrop} isCardInserted={isCardInserted} />
                </div>

                {/* Keyboard pad horizontally centered */}
                <div className="w-full flex justify-center pb-4 mt-8">
                   <ATMKeypad onKeyClick={handleKeyClick} onActionClick={handleActionClick} />
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ATMFrame;
