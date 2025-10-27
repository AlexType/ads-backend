const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || 
                  req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: { message: 'Токен не предоставлен', code: 'AUTH_REQUIRED' }
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: { message: 'Пользователь не найден', code: 'USER_NOT_FOUND' }
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        error: { message: 'Аккаунт деактивирован', code: 'ACCOUNT_DISABLED' }
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      error: { message: 'Недействительный токен', code: 'INVALID_TOKEN' }
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: { message: 'Доступ запрещен', code: 'FORBIDDEN' }
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };

