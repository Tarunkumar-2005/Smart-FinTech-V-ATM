const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect);
router.use(admin);

router.get('/users', adminController.getUsers);
router.get('/transactions', adminController.getTransactions);

module.exports = router;
