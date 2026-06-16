import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  // OTP setup state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpVal, setOtpVal] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(15);
  const [isOtpTimerActive, setIsOtpTimerActive] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [showSmsToast, setShowSmsToast] = useState(false);
  const [smsNotification, setSmsNotification] = useState(null);

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

  // OTP countdown timer
  useEffect(() => {
    let timer;
    if (isOtpTimerActive && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && isOtpTimerActive) {
      setIsOtpTimerActive(false);
      setOtpExpired(true);
      setOtpMessage(language === 'HI' ? 'ओटीपी समाप्त हो गया है। कृपया नया ओटीपी भेजें।' : 'OTP expired. Please resend OTP.');
    }
    return () => clearInterval(timer);
  }, [otpTimer, isOtpTimerActive, language]);

  // SMS slide-in timer
  useEffect(() => {
    if (smsNotification) {
      setShowSmsToast(true);
      const t = setTimeout(() => {
        setShowSmsToast(false);
      }, 8000);
      return () => clearTimeout(t);
    }
  }, [smsNotification]);

  // OTP handlers
  const verifyOtpCode = async () => {
    if (otpVal.length !== 6) {
      setOtpMessage(language === 'HI' ? 'ओटीपी 6 अंकों का होना चाहिए' : 'OTP must be 6 digits');
      return;
    }
    setIsVerifying(true);
    try {
      setOtpMessage('');
      await API.post('/account/verify-otp', { accountNumber: amountInput, otp: otpVal });
      setShowOtpModal(false);
      setShowSmsToast(false);
      setSmsNotification(null);
      setIsOtpTimerActive(false);
      setCurrentScreen('CHANGE_PIN_NEW');
      setPinInput('');
      setMessage('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setOtpMessage(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtpCode = async () => {
    setIsVerifying(true);
    try {
      setOtpMessage('');
      const res = await API.post('/account/generate-otp', { accountNumber: amountInput });
      setGeneratedOtp(res.data.otp);
      setSmsNotification({ otp: res.data.otp });
      setOtpTimer(15);
      setIsOtpTimerActive(true);
      setOtpExpired(false);
      setOtpVal('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to resend OTP.';
      setOtpMessage(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setShowSmsToast(false);
    setSmsNotification(null);
    setIsOtpTimerActive(false);
    setGeneratedOtp('');
    setOtpVal('');
    setCurrentScreen('SET_PIN_ENTER_ACC');
  };

  const addTransaction = (desc, amount, type) => {
    const today = new Date().toISOString().split('T')[0];
    const newTx = { date: today, desc, amount, type };
    setTransactions(prev => [newTx, ...prev].slice(0, 5));
  };

  const handleKeyClick = (key) => {
    if (showOtpModal) {
      if (otpVal.length < 6) setOtpVal((prev) => prev + key);
      return;
    }
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
            setMessage(language === 'HI' 
                ? 'आपका पिन सफलतापूर्वक सेट कर दिया गया है।\nअब आप सभी एटीएम सुविधाओं का उपयोग कर सकते हैं।' 
                : 'PIN has been set successfully.\nYou can now access all ATM features.');
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
    
    if (showOtpModal) {
      if (action === 'CANCEL') {
        closeOtpModal();
      } else if (action === 'CLEAR') {
        setOtpVal('');
      } else if (action === 'ENTER') {
        verifyOtpCode();
      }
      return;
    }

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
        if (!amountInput) {
           setMessage(language === 'HI' ? 'कृपया खाता संख्या दर्ज करें' : 'Please enter Account Number');
           return;
        }

        const startOtpFlow = async () => {
          setIsVerifying(true);
          try {
            const res = await API.post('/account/generate-otp', { accountNumber: amountInput });
            setGeneratedOtp(res.data.otp);
            setSmsNotification({ otp: res.data.otp });
            setOtpTimer(15);
            setIsOtpTimerActive(true);
            setOtpExpired(false);
            setOtpVal('');
            setOtpMessage('');
            setShowOtpModal(true);
            setMessage('');
          } catch (err) {
            const errorMsg = err.response?.data?.message || 'Verification Failed. Account may not exist or PIN is already set.';
            setMessage(errorMsg);
          } finally {
            setIsVerifying(false);
          }
        };
        startOtpFlow();
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

        {/* Simulated SMS Notification Toast */}
        <AnimatePresence>
          {showSmsToast && smsNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="fixed top-6 right-6 z-[9999] max-w-sm w-full bg-slate-900/95 border border-blue-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-2xl p-4 backdrop-blur-md flex items-start gap-4 text-left font-sans"
            >
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-200">SmartBank SMS</span>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-semibold">
                  {language === 'HI' ? 'ओटीपी सफलतापूर्वक भेजा गया' : 'OTP Sent Successfully'}
                </p>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 mt-2 font-mono text-center text-lg tracking-wider text-yellow-300">
                  OTP: <span className="font-bold text-xl select-all">{smsNotification.otp}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-2">
                  {language === 'HI' ? '*सिम्युलेटेड मोबाइल डिलीवरी। 15 सेकंड में समाप्त।' : '*Simulated mobile delivery. Expires in 15 seconds.'}
                </div>
              </div>
              <button onClick={() => setShowSmsToast(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Verification Modal */}
        <AnimatePresence>
          {showOtpModal && (
            <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 font-sans">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeOtpModal}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 overflow-hidden text-left"
              >
                <div className="absolute top-0 right-0 p-4">
                  <button
                    onClick={closeOtpModal}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-col items-center text-center">
                  {/* Lock Icon */}
                  <div className="p-3 bg-green-500/10 text-green-400 rounded-full mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>

                  <h2 className="text-xl font-bold text-slate-100">
                    {language === 'HI' ? 'एटीएम सुरक्षा सत्यापन' : 'ATM Security Verification'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'HI' ? 'प्रथम बार पिन सेटअप हेतु ओटीपी आवश्यक' : 'OTP verification is required for first-time PIN setup'}
                  </p>

                  {/* Account Number Details */}
                  <div className="w-full bg-slate-950/40 border border-slate-800 rounded-xl p-3 mt-4 text-left font-mono">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">{language === 'HI' ? 'खाता संख्या:' : 'Account Number:'}</span>
                      <span className="font-bold text-slate-200 tracking-wider">
                        {amountInput}
                      </span>
                    </div>
                  </div>

                  {/* OTP Input Form */}
                  <div className="w-full mt-6 text-left">
                    <label className="block text-sm font-semibold text-slate-300 text-left mb-2">
                      {language === 'HI' ? '6-अंकीय ओटीपी दर्ज करें' : 'Enter 6-Digit OTP'}
                    </label>
                    
                    <input
                      type="text"
                      maxLength={6}
                      value={otpVal}
                      onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          verifyOtpCode();
                        }
                      }}
                      className="w-full text-center text-3xl tracking-[0.5em] font-mono py-3 rounded-xl bg-slate-950/60 border border-slate-700/80 focus:border-green-400 focus:ring-1 focus:ring-green-400 text-green-300 outline-none transition-all shadow-inner"
                    />

                    {/* Message/Errors */}
                    {otpMessage && (
                      <p className="text-red-400 text-xs font-semibold mt-2.5 text-left bg-red-900/10 border border-red-900/20 px-3 py-2 rounded-lg">
                        {otpMessage}
                      </p>
                    )}

                    {/* Countdown Timer & Resend */}
                    <div className="flex items-center justify-between mt-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${otpExpired ? 'bg-red-400' : 'bg-green-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${otpExpired ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        </span>
                        <span className={`text-sm font-semibold ${otpExpired ? 'text-red-400' : otpTimer <= 5 ? 'text-orange-400 animate-pulse' : 'text-slate-300'}`}>
                          {language === 'HI' ? `शेष समय: ${otpTimer}s` : `Time Remaining: ${otpTimer}s`}
                        </span>
                      </div>

                      <button
                        onClick={resendOtpCode}
                        disabled={!otpExpired && isOtpTimerActive}
                        className={`text-xs font-bold transition-all px-3 py-1.5 rounded-lg border ${
                          otpExpired 
                            ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 cursor-pointer' 
                            : 'text-slate-500 border-slate-800 bg-slate-950/30 cursor-not-allowed'
                        }`}
                      >
                        {language === 'HI' ? 'ओटीपी पुनः भेजें' : 'Resend OTP'}
                      </button>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="grid grid-cols-2 gap-4 w-full mt-8 font-sans">
                    <button
                      onClick={closeOtpModal}
                      className="py-3 px-4 rounded-xl border border-slate-700/60 bg-slate-950/20 text-slate-300 font-semibold text-sm hover:bg-slate-950/40 hover:text-white transition-all active:scale-95 animate-none"
                    >
                      {language === 'HI' ? 'बंद करें' : 'Close'}
                    </button>
                    <button
                      onClick={verifyOtpCode}
                      disabled={otpExpired || otpVal.length < 6}
                      className={`py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 ${
                        otpExpired || otpVal.length < 6
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/30'
                          : 'bg-green-500 hover:bg-green-400 text-slate-950 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] cursor-pointer'
                      }`}
                    >
                      {language === 'HI' ? 'सत्यापित करें' : 'Verify & Proceed'}
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default ATMFrame;
