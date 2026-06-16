const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { protect } = require('../middleware/auth');
const {
  depositValidation,
  withdrawValidation,
  handleValidationErrors,
} = require('../utils/validation');

router.use(protect);

router.get('/balance',    accountController.getBalance);
router.post('/deposit',   depositValidation, handleValidationErrors, accountController.deposit);
router.post('/withdraw',  withdrawValidation, handleValidationErrors, accountController.withdraw);
router.get('/transactions', accountController.getTransactions);
router.post('/change-pin',  accountController.changePin);
router.post('/set-pin',     accountController.setPin);
router.post('/generate-otp', accountController.generateOtp);
router.post('/verify-otp',   accountController.verifyOtp);

// ── Progress tracker routes ───────────────────────────────────────────────────
router.get('/progress',   accountController.getProgress);   // GET current progress
router.post('/progress',  accountController.markStep);       // POST { step } to mark a step

module.exports = router;
