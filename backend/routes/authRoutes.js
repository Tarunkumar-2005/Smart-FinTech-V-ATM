const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  registerValidation,
  loginValidation,
  handleValidationErrors,
} = require('../utils/validation');

router.post('/register', registerValidation, handleValidationErrors, authController.register);
router.post('/login', loginValidation, handleValidationErrors, authController.login);

module.exports = router;
