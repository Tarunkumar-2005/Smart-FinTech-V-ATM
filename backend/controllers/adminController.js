const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-pin')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'name accountNumber')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
