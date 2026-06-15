import { createContext, useContext, useReducer, useCallback } from 'react';
import API from '../api/axios';

// State machine states
export const ATM_STATES = {
  WELCOME: 'WELCOME',
  LANGUAGE: 'LANGUAGE',
  ACCOUNT_NUMBER: 'ACCOUNT_NUMBER',
  ENTER_PIN: 'ENTER_PIN',
  PIN_WRONG: 'PIN_WRONG',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  MENU: 'MENU',
  WITHDRAW_AMOUNT: 'WITHDRAW_AMOUNT',
  WITHDRAW_OTHER: 'WITHDRAW_OTHER',
  WITHDRAW_CONFIRM: 'WITHDRAW_CONFIRM',
  WITHDRAW_PROCESSING: 'WITHDRAW_PROCESSING',
  WITHDRAW_SUCCESS: 'WITHDRAW_SUCCESS',
  BALANCE: 'BALANCE',
  MINI_STATEMENT: 'MINI_STATEMENT',
  DEPOSIT_AMOUNT: 'DEPOSIT_AMOUNT',
  DEPOSIT_CONFIRM: 'DEPOSIT_CONFIRM',
  DEPOSIT_PROCESSING: 'DEPOSIT_PROCESSING',
  DEPOSIT_SUCCESS: 'DEPOSIT_SUCCESS',
  ANOTHER_TRANSACTION: 'ANOTHER_TRANSACTION',
  EXIT: 'EXIT',
  CHANGE_PIN: 'CHANGE_PIN',
};

const initialState = {
  state: ATM_STATES.WELCOME,
  language: 'en',
  accountNumber: '',
  pin: '',
  pinAttempts: 0,
  user: null,
  token: null,
  balance: 0,
  transactions: [],
  withdrawAmount: null,
  withdrawInput: '',
  depositAmount: null,
  depositInput: '',
  lastError: null,
};

function atmReducer(state, action) {
  switch (action.type) {
    case 'INSERT_CARD':
      return { ...state, state: ATM_STATES.LANGUAGE };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload, state: ATM_STATES.ACCOUNT_NUMBER };
    case 'SET_ACCOUNT_NUMBER':
      return { ...state, accountNumber: action.payload };
    case 'ACCOUNT_ENTER':
      return { ...state, state: ATM_STATES.ENTER_PIN, pin: '', pinAttempts: 0 };
    case 'SET_PIN':
      return { ...state, pin: action.payload };
    case 'PIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        balance: action.payload.balance,
        state: ATM_STATES.MENU,
        pin: '',
        pinAttempts: 0,
        lastError: null,
      };
    case 'PIN_WRONG':
      return {
        ...state,
        state: ATM_STATES.PIN_WRONG,
        pin: '',
        pinAttempts: state.pinAttempts + 1,
        lastError: 'Incorrect PIN. Please try again.',
      };
    case 'PIN_RETRY':
      return { ...state, state: ATM_STATES.ENTER_PIN };
    case 'ACCOUNT_LOCKED':
      return { ...state, state: ATM_STATES.ACCOUNT_LOCKED };
    case 'MENU_SELECT':
      return { ...state, state: action.payload, depositInput: '', withdrawInput: '' };
    case 'SET_WITHDRAW_INPUT':
      return { ...state, withdrawInput: action.payload };
    case 'SET_DEPOSIT_INPUT':
      return { ...state, depositInput: action.payload };
    case 'SET_WITHDRAW_OTHER_AMOUNT':
      return { ...state, state: ATM_STATES.WITHDRAW_CONFIRM, withdrawAmount: action.payload };
    case 'SET_WITHDRAW_AMOUNT':
      return { ...state, withdrawAmount: action.payload, state: ATM_STATES.WITHDRAW_CONFIRM };
    case 'WITHDRAW_CONFIRM':
      return { ...state, state: ATM_STATES.WITHDRAW_PROCESSING };
    case 'WITHDRAW_SUCCESS':
      return {
        ...state,
        state: ATM_STATES.WITHDRAW_SUCCESS,
        balance: action.payload,
        withdrawAmount: null,
      };
    case 'WITHDRAW_FAIL':
      return { ...state, state: ATM_STATES.MENU, lastError: action.payload, withdrawAmount: null };
    case 'SET_DEPOSIT_AMOUNT':
      return { ...state, depositAmount: action.payload, depositInput: '', state: ATM_STATES.DEPOSIT_CONFIRM };
    case 'DEPOSIT_CONFIRM':
      return { ...state, state: ATM_STATES.DEPOSIT_PROCESSING };
    case 'DEPOSIT_SUCCESS':
      return {
        ...state,
        state: ATM_STATES.DEPOSIT_SUCCESS,
        balance: action.payload,
        depositAmount: null,
      };
    case 'DEPOSIT_FAIL':
      return { ...state, state: ATM_STATES.MENU, lastError: action.payload, depositAmount: null };
    case 'BALANCE_DONE':
      return { ...state, state: ATM_STATES.ANOTHER_TRANSACTION };
    case 'STATEMENT_DONE':
      return { ...state, state: ATM_STATES.ANOTHER_TRANSACTION };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'UPDATE_BALANCE':
      return { ...state, balance: action.payload };
    case 'ANOTHER_YES':
      return { ...state, state: ATM_STATES.MENU };
    case 'ANOTHER_NO':
      return { ...state, state: ATM_STATES.EXIT };
    case 'BACK_TO_MENU':
      return { ...state, state: ATM_STATES.MENU, lastError: null };
    case 'CANCEL':
      return { ...state, state: ATM_STATES.MENU, withdrawAmount: null, depositAmount: null, lastError: null };
    case 'RESET':
      return {
        ...initialState,
        language: state.language,
      };
    default:
      return state;
  }
}

const ATMStateContext = createContext(null);

export function ATMStateProvider({ children }) {
  const [state, dispatch] = useReducer(atmReducer, initialState);

  const login = useCallback(async (accountNumber, pin) => {
    try {
      const { data } = await API.post('/auth/login', { accountNumber, pin });
      const u = data.data;
      localStorage.setItem('token', u.token);
      localStorage.setItem('user', JSON.stringify(u));
      dispatch({
        type: 'PIN_SUCCESS',
        payload: { user: u, token: u.token, balance: u.balance },
      });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  }, []);

  const withdraw = useCallback(async (amount) => {
    try {
      const { data } = await API.post('/account/withdraw', { amount });
      dispatch({ type: 'WITHDRAW_SUCCESS', payload: data.data.balance });
    } catch (err) {
      dispatch({ type: 'WITHDRAW_FAIL', payload: err.response?.data?.message || 'Withdrawal failed' });
    }
  }, []);

  const deposit = useCallback(async (amount) => {
    try {
      const { data } = await API.post('/account/deposit', { amount });
      dispatch({ type: 'DEPOSIT_SUCCESS', payload: data.data.balance });
    } catch (err) {
      dispatch({ type: 'DEPOSIT_FAIL', payload: err.response?.data?.message || 'Deposit failed' });
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      const { data } = await API.get('/account/balance');
      return data.data.balance;
    } catch (err) {
      return null;
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const { data } = await API.get('/account/transactions?limit=5');
      return data.data || [];
    } catch (err) {
      return [];
    }
  }, []);

  return (
    <ATMStateContext.Provider
      value={{
        state,
        dispatch,
        login,
        withdraw,
        deposit,
        fetchBalance,
        fetchTransactions,
      }}
    >
      {children}
    </ATMStateContext.Provider>
  );
}

export function useATMState() {
  const ctx = useContext(ATMStateContext);
  if (!ctx) throw new Error('useATMState must be used within ATMStateProvider');
  return ctx;
}
