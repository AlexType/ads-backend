const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User.model');
const logger = require('../utils/logger');

// Генерация токенов
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );

  return { accessToken, refreshToken };
};

// Установка cookies для аутентификации
const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    httpOnly: true,
    secure: true, // Всегда true для cross-domain
    // sameSite: 'none' обязательно для cross-domain cookies в HTTPS
    sameSite: 'none',
    // Не указываем domain для cross-subdomain работы
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 минут
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
  });
};

// Регистрация
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'Email уже используется', code: 'EMAIL_EXISTS' }
      });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'advertiser'
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Устанавливаем cookies
    setAuthCookies(res, accessToken, refreshToken);

    logger.info(`User registered: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Вход
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Неверный email или пароль', code: 'INVALID_CREDENTIALS' }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn(`Failed login attempt: ${email}`);
      return res.status(401).json({
        success: false,
        error: { message: 'Неверный email или пароль', code: 'INVALID_CREDENTIALS' }
      });
    }

    // Если включена 2FA
    if (user.twoFactorEnabled) {
      return res.json({
        success: true,
        requiresTwoFactor: true,
        tempToken: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' })
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    setAuthCookies(res, accessToken, refreshToken);

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    logger.info(`User logged in: ${user.email} (${user.role})`);

    res.json({
      success: true,
      message: 'Вход выполнен успешно',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Выход
const logout = async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Выход выполнен успешно' });
};

// Обновление токена
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: { message: 'Refresh токен не предоставлен', code: 'REFRESH_REQUIRED' }
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    setAuthCookies(res, accessToken, newRefreshToken);

    res.json({ success: true, message: 'Токен обновлен' });
  } catch (error) {
    next(error);
  }
};

// Включить 2FA
const enable2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        error: { message: '2FA уже включена', code: 'ALREADY_ENABLED' }
      });
    }

    const secret = speakeasy.generateSecret({
      name: `${process.env.TWO_FACTOR_ISSUER} (${user.email})`,
      length: 32
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      data: {
        qrCode: qrCodeUrl,
        secret: secret.base32
      }
    });
  } catch (error) {
    next(error);
  }
};

// Подтвердить включение 2FA
const verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        error: { message: '2FA не настроена', code: 'NOT_SETUP' }
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        error: { message: 'Неверный код', code: 'INVALID_TOKEN' }
      });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({
      success: true,
      message: '2FA успешно включена'
    });
  } catch (error) {
    next(error);
  }
};

// Отключить 2FA
const disable2FA = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: 'Неверный пароль', code: 'INVALID_PASSWORD' }
      });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({
      success: true,
      message: '2FA отключена'
    });
  } catch (error) {
    next(error);
  }
};

// Вход с 2FA
const loginWith2FA = async (req, res, next) => {
  try {
    const { tempToken, twoFactorToken } = req.body;

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('+twoFactorSecret');

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        error: { message: '2FA не настроена', code: 'NOT_SETUP' }
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        error: { message: 'Неверный код 2FA', code: 'INVALID_2FA' }
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    setAuthCookies(res, accessToken, refreshToken);

    logger.info(`User logged in with 2FA: ${user.email}`);

    res.json({
      success: true,
      message: 'Вход выполнен успешно',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
          twoFactorEnabled: user.twoFactorEnabled
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Забыли пароль
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Для безопасности не раскрываем, существует ли пользователь
      return res.json({
        success: true,
        message: 'Если пользователь с таким email существует, мы отправили инструкции на email'
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Здесь должна быть отправка email с resetToken
    // В разработке выводим в консоль
    console.log('Reset password URL:', `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password/${resetToken}`);

    logger.info(`Password reset requested for: ${email}`);

    res.json({
      success: true,
      message: 'Если пользователь с таким email существует, мы отправили инструкции на email'
    });
  } catch (error) {
    next(error);
  }
};

// Сброс пароля
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Хэшируем токен для сравнения
    const resetPasswordToken = require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: { message: 'Токен недействителен или истек', code: 'INVALID_TOKEN' }
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    res.json({
      success: true,
      message: 'Пароль успешно изменен'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
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
};

