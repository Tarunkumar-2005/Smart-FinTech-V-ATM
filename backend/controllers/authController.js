const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // 1. Check if name is already taken (case-insensitive)
    const nameExists = await User.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: 'This name is already registered. Please choose a different name.',
      });
    }

    const accountNumber = await User.generateAccountNumber();

    const user = await User.create({ 
      name, 
      phoneNumber: phone, 
      address, 
      pin: null, 
      pinSet: false,
      accountNumber 
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user._id,
        name: user.name,
        accountNumber: user.accountNumber,
        balance: user.balance,
        role: user.role,
        pinSet: user.pinSet,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { accountNumber, pin, name } = req.body;

    const user = await User.findOne({ accountNumber }).select('+pin +pinSet +failedLoginAttempts +lockUntil');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid account number or PIN',
      });
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Account temporarily blocked due to 3 failed attempts. Please try again after 5 minutes.',
      });
    }

    if (user.pinSet === false) {
      // NEW USER LOGIN: Require Full Name instead of PIN
      if (!name || user.name.toLowerCase() !== name.toLowerCase()) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Please provide your Full Name to login (PIN not set yet).',
        });
      }
    } else {
      // NORMAL LOGIN: Require PIN
      if (!pin) {
        return res.status(401).json({
          success: false,
          message: 'Please provide your 4-digit PIN.',
        });
      }
      const isMatch = await user.comparePin(pin);
      if (!isMatch) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= 3) {
          user.lockUntil = new Date(Date.now() + 5 * 60 * 1000); // Lock for 5 minutes
          await user.save();
          return res.status(401).json({
            success: false,
            message: 'Account temporarily blocked due to 3 failed attempts. Please try again after 5 minutes.',
          });
        }
        await user.save();
        return res.status(401).json({
          success: false,
          message: 'Incorrect PIN. Please try again.',
        });
      }
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        accountNumber: user.accountNumber,
        balance: user.balance,
        role: user.role,
        pinSet: user.pinSet,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
