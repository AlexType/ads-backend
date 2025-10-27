const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  refresh,
  enable2FA,
  verify2FA,
  disable2FA,
  loginWith2FA,
  forgotPassword,
  resetPassword
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { 
  validateRegister, 
  validateLogin,
  validate2FAVerify,
  validate2FADisable,
  validateLogin2FA,
  validateForgotPassword,
  validateResetPassword
} = require('../validators/auth.validator');
const rateLimit = require('express-rate-limit');

// Rate limiting для auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 1000, // В разработке очень большие лимиты
  message: { success: false, error: { message: 'Слишком много попыток', code: 'TOO_MANY_REQUESTS' } },
  standardHeaders: true,
  legacyHeaders: false,
  // В development более мягкая обработка
  ...(process.env.NODE_ENV === 'development' && {
    skip: (req) => {
      // Пропускаем rate limiting для localhost в development
      return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    }
  })
});

// Основные маршруты аутентификации
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);

// 2FA маршруты
router.post('/login-2fa', authLimiter, validateLogin2FA, loginWith2FA);
router.post('/2fa/enable', authenticate, enable2FA);
router.post('/2fa/verify', authenticate, validate2FAVerify, verify2FA);
router.post('/2fa/disable', authenticate, validate2FADisable, disable2FA);

// Восстановление пароля
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', authLimiter, validateResetPassword, resetPassword);

module.exports = router;

