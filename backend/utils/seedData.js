require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const connectDB = require('../config/db');

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data (optional - comment out to preserve data)
    await Transaction.deleteMany({});
    await User.deleteMany({});

    // Create admin user (PIN: 1234)
    const admin = await User.create({
      name: 'Admin User',
      accountNumber: '1234567890',
      pin: '1234',
      balance: 100000,
      role: 'admin',
    });
    console.log('Admin created:', admin.accountNumber, '| PIN: 1234');

    // Create sample users with default PIN
    const users = [];
    for (const { name, pin } of [
      { name: 'John Doe', pin: '1234' },
      { name: 'Jane Smith', pin: '5678' },
      { name: 'Alice Johnson', pin: '9999' },
    ]) {
      const accountNumber = await User.generateAccountNumber();
      users.push(await User.create({ name, pin, accountNumber }));
    }

    // Create sample transactions for first user
    for (const t of [
      { type: 'deposit', amount: 1000, balanceAfter: 6000 },
      { type: 'withdraw', amount: 500, balanceAfter: 5500 },
      { type: 'deposit', amount: 2000, balanceAfter: 7500 },
      { type: 'withdraw', amount: 1000, balanceAfter: 6500 },
      { type: 'deposit', amount: 500, balanceAfter: 7000 },
    ]) {
      await Transaction.create({
        userId: users[0]._id,
        type: t.type,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
      });
    }

    console.log('Sample users:');
    for (const u of users) {
      console.log(`  ${u.name} | Account: ${u.accountNumber} | Balance: ₹${u.balance}`);
    }
    console.log('\nSeed completed successfully!');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    process.exit(0);
  }
};

seed();
