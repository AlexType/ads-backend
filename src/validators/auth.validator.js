const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email адрес')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Пароль должен быть от 8 до 128 символов')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Пароль должен содержать заглавные, строчные буквы и цифры'),
  body('firstName')
    .notEmpty()
    .withMessage('Имя обязательно')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно быть от 2 до 50 символов'),
  body('lastName')
    .notEmpty()
    .withMessage('Фамилия обязательна')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Фамилия должна быть от 2 до 50 символов'),
  body('role')
    .optional()
    .isIn(['blogger', 'advertiser'])
    .withMessage('Роль должна быть blogger или advertiser'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    return res.status(422).json({
      success: false,
      message: 'Ошибка валидации данных',
      errors: formattedErrors
    });
  }
  
  next();
};

const validate2FAVerify = [
  body('token')
    .notEmpty()
    .withMessage('Код обязателен')
    .isLength({ min: 6, max: 6 })
    .withMessage('Код должен содержать 6 цифр')
    .matches(/^\d{6}$/)
    .withMessage('Код должен содержать только цифры'),
];

const validate2FADisable = [
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен'),
];

const validateLogin2FA = [
  body('tempToken')
    .notEmpty()
    .withMessage('Временный токен обязателен'),
  body('twoFactorToken')
    .notEmpty()
    .withMessage('Код 2FA обязателен')
    .isLength({ min: 6, max: 6 })
    .withMessage('Код должен содержать 6 цифр')
    .matches(/^\d{6}$/)
    .withMessage('Код должен содержать только цифры'),
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .normalizeEmail(),
];

const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Токен обязателен'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Пароль должен быть от 8 до 128 символов')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Пароль должен содержать заглавные, строчные буквы, цифры и специальные символы'),
];

module.exports = {
  validateRegister: [...validateRegister, handleValidationErrors],
  validateLogin: [...validateLogin, handleValidationErrors],
  validate2FAVerify: [...validate2FAVerify, handleValidationErrors],
  validate2FADisable: [...validate2FADisable, handleValidationErrors],
  validateLogin2FA: [...validateLogin2FA, handleValidationErrors],
  validateForgotPassword: [...validateForgotPassword, handleValidationErrors],
  validateResetPassword: [...validateResetPassword, handleValidationErrors]
};

