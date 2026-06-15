const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
];

const loginValidation = [
  body('accountNumber')
    .trim()
    .notEmpty()
    .withMessage('Account number is required')
    .isLength({ min: 10, max: 10 })
    .withMessage('Account number must be 10 digits')
    .isNumeric()
    .withMessage('Account number must contain only numbers'),
  body('pin')
    .optional({ checkFalsy: true })
    .isLength({ min: 4, max: 4 })
    .withMessage('PIN must be exactly 4 digits')
    .isNumeric()
    .withMessage('PIN must contain only numbers'),
];

const depositValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number'),
];

const withdrawValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be a positive number'),
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  depositValidation,
  withdrawValidation,
};
