const User = require('../models/User');
const Transaction = require('../models/Transaction');

const DAILY_WITHDRAWAL_LIMIT = 10000;

// ─── Valid steps that the frontend may mark via POST ─────────────────────────
const FRONTEND_MARKABLE_STEPS = [
  'cardInserted',
  'pinAuthenticated',
  'quizCompleted',
  'aiHelpUsed',
];

const defaultProgress = () => ({
  accountRegistered:          true,
  accountVerified:            true,
  atmCardGenerated:           true,
  pinSet:                     false,
  cardInserted:               false,
  pinAuthenticated:           false,
  firstTransactionCompleted:  false,
  withdrawCompleted:          false,
  balanceChecked:             false,
  miniStatementViewed:        false,
  pinChanged:                 false,
  quizCompleted:              false,
  aiHelpUsed:                 false,
});

// ─── Helper: silently mark one or many progress steps (uses $set + dot-notation) ─
const markProgressSteps = async (userId, steps) => {
  try {
    const setObj = {};
    steps.forEach((s) => { setObj[`progress.${s}`] = true; });
    await User.findByIdAndUpdate(userId, { $set: setObj }, { new: false });
  } catch (_) {
    // Non-critical – never fail the main operation
  }
};

// ─── Helper: Reset daily withdrawal if date changed ──────────────────────────
const checkAndResetDailyLimit = async (user) => {
  const now = new Date();
  if (user.lastWithdrawDate) {
    const lastDate = new Date(user.lastWithdrawDate);
    if (
      lastDate.getDate() !== now.getDate() ||
      lastDate.getMonth() !== now.getMonth() ||
      lastDate.getFullYear() !== now.getFullYear()
    ) {
      user.dailyWithdrawnAmount = 0;
      user.lastWithdrawDate = null;
      await user.save();
    }
  }
};

// @desc    Get balance
// @route   GET /api/account/balance
// @access  Private
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Mark balanceChecked + firstTransactionCompleted progress
    await markProgressSteps(req.user._id, ['balanceChecked', 'firstTransactionCompleted']);

    res.json({
      success: true,
      data: {
        balance: user.balance,
        accountNumber: user.accountNumber,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Deposit money
// @route   POST /api/account/deposit
// @access  Private
exports.deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
    }

    user.balance += depositAmount;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'deposit',
      amount: depositAmount,
      balanceAfter: user.balance,
    });

    // Mark firstTransactionCompleted progress
    await markProgressSteps(req.user._id, ['firstTransactionCompleted']);

    res.json({
      success: true,
      message: `Successfully deposited ₹${depositAmount}`,
      data: { balance: user.balance, amount: depositAmount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Withdraw money
// @route   POST /api/account/withdraw
// @access  Private
exports.withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);

    await checkAndResetDailyLimit(user);

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
    }

    if (withdrawAmount % 500 !== 0) {
      return res.status(400).json({ success: false, message: 'Please enter amount in multiples of ₹500.' });
    }

    if (user.balance < withdrawAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    const remainingDailyLimit = DAILY_WITHDRAWAL_LIMIT - user.dailyWithdrawnAmount;
    if (withdrawAmount > remainingDailyLimit) {
      return res.status(400).json({
        success: false,
        message: `Daily withdrawal limit exceeded. You can withdraw up to ₹${remainingDailyLimit} more today.`,
      });
    }

    user.balance -= withdrawAmount;
    user.dailyWithdrawnAmount += withdrawAmount;
    user.lastWithdrawDate = new Date();
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'withdraw',
      amount: withdrawAmount,
      balanceAfter: user.balance,
    });

    // Mark withdrawCompleted + firstTransactionCompleted progress
    await markProgressSteps(req.user._id, ['withdrawCompleted', 'firstTransactionCompleted']);

    res.json({
      success: true,
      message: `Successfully withdrew ₹${withdrawAmount}`,
      data: { balance: user.balance, amount: withdrawAmount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get mini statement (last N transactions)
// @route   GET /api/account/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const typeFilter = req.query.type; // 'deposit' | 'withdraw' | undefined

    const query = { userId: req.user._id };
    if (typeFilter && ['deposit', 'withdraw'].includes(typeFilter)) {
      query.type = typeFilter;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit === 0 ? undefined : limit)  // 0 = fetch all
      .lean();

    // Mark miniStatementViewed progress (any transactions fetch = mini statement viewed)
    await markProgressSteps(req.user._id, ['miniStatementViewed']);

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Change user PIN
// @route   POST /api/account/change-pin
// @access  Private
exports.changePin = async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;

    if (!currentPin || !newPin) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new PIN' });
    }

    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ success: false, message: 'New PIN must be exactly 4 digits' });
    }

    const user = await User.findById(req.user._id).select('+pin');

    const isMatch = await user.comparePin(currentPin);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current PIN. Please try again.' });
    }

    const isSamePin = await user.comparePin(newPin);
    if (isSamePin) {
      return res.status(400).json({ success: false, message: 'New PIN cannot be the same as the current PIN.' });
    }

    user.pin = newPin;
    await user.save();

    // Mark pinChanged progress
    await markProgressSteps(req.user._id, ['pinChanged']);

    res.json({ success: true, message: 'Your PIN has been successfully updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Set user PIN (initial)
// @route   POST /api/account/set-pin
// @access  Private
exports.setPin = async (req, res) => {
  try {
    const { newPin } = req.body;

    if (!newPin) {
      return res.status(400).json({ success: false, message: 'Please provide new PIN.' });
    }

    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ success: false, message: 'New PIN must be exactly 4 digits.' });
    }

    const user = await User.findById(req.user._id);

    if (user.pinSet) {
       return res.status(400).json({ success: false, message: 'PIN is already set. Please use the Change PIN feature instead.' });
    }

    user.pin = newPin;
    user.pinSet = true;
    await user.save();

    // Mark pinSet progress step
    await markProgressSteps(req.user._id, ['pinSet']);

    res.json({ success: true, message: 'Your PIN has been successfully set.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get progress tracker data
// @route   GET /api/account/progress
// @access  Private
exports.getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Merge existing progress with defaults (handles pre-progress users gracefully)
    const merged = { ...defaultProgress(), ...(user.progress ? user.progress.toObject() : {}) };

    res.json({ success: true, data: merged });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Mark a frontend-triggered progress step
// @route   POST /api/account/progress
// @access  Private
exports.markStep = async (req, res) => {
  try {
    const { step } = req.body;

    if (!step || !FRONTEND_MARKABLE_STEPS.includes(step)) {
      return res.status(400).json({
        success: false,
        message: `Invalid step. Allowed: ${FRONTEND_MARKABLE_STEPS.join(', ')}`,
      });
    }

    await markProgressSteps(req.user._id, [step]);

    // Return updated progress
    const user = await User.findById(req.user._id);
    const merged = { ...defaultProgress(), ...(user.progress ? user.progress.toObject() : {}) };

    res.json({ success: true, data: merged });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
