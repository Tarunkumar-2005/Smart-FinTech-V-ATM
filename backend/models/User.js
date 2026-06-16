const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: 'Account number must be 10 digits',
      },
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    pin: {
      type: String,
      select: false,
      default: null,
    },
    pinSet: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: Number,
      default: 5000,
      min: 0,
    },
    dailyWithdrawnAmount: {
      type: Number,
      default: 0,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastWithdrawDate: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    tempOtp: {
      type: String,
      default: null,
    },
    tempOtpExpires: {
      type: Date,
      default: null,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    // ── Progress Tracker (13-step ATM learning journey) ──────────────────
    progress: {
      // ── Group 1: Account Setup (auto-completed on registration) ─────────
      accountRegistered:          { type: Boolean, default: true  },
      accountVerified:            { type: Boolean, default: true  },
      atmCardGenerated:           { type: Boolean, default: true  },
      pinSet:                     { type: Boolean, default: true  },
      // ── Group 2: ATM Usage (completed via live actions) ──────────────────
      cardInserted:               { type: Boolean, default: false },
      pinAuthenticated:           { type: Boolean, default: false },
      firstTransactionCompleted:  { type: Boolean, default: false },
      withdrawCompleted:          { type: Boolean, default: false },
      balanceChecked:             { type: Boolean, default: false },
      miniStatementViewed:        { type: Boolean, default: false },
      pinChanged:                 { type: Boolean, default: false },
      // ── Group 3: Learning ────────────────────────────────────────────────
      quizCompleted:              { type: Boolean, default: false },
      aiHelpUsed:                 { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Hash PIN before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('pin') || !this.pin) return next();
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
  next();
});

// Generate unique 10-digit account number
userSchema.statics.generateAccountNumber = async function () {
  let accountNumber;
  let exists = true;

  while (exists) {
    accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    exists = await this.findOne({ accountNumber });
  }
  return accountNumber;
};

// Compare PIN method
userSchema.methods.comparePin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model('User', userSchema);
