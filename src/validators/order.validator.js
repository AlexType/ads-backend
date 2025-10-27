const { body, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const validateCreateOrder = [
  body('campaignId')
    .notEmpty()
    .withMessage('ID кампании обязателен')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Неверный формат ID кампании');
      }
      return true;
    }),
  
  body('bloggerId')
    .notEmpty()
    .withMessage('ID блогера обязателен')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Неверный формат ID блогера');
      }
      return true;
    }),
  
  body('contentType')
    .notEmpty()
    .withMessage('Тип контента обязателен')
    .isIn(['post', 'story', 'reel', 'video', 'collaboration'])
    .withMessage('Неверный тип контента'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Описание должно быть от 10 до 2000 символов'),
  
  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Требования не должны превышать 1000 символов'),
  
  body('deadline')
    .notEmpty()
    .withMessage('Дедлайн обязателен')
    .isISO8601()
    .withMessage('Дедлайн должен быть в формате ISO 8601')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Дедлайн не может быть в прошлом');
      }
      return true;
    }),
  
  body('price')
    .notEmpty()
    .withMessage('Цена обязательна')
    .isFloat({ min: 100 })
    .withMessage('Цена должна быть не менее 100 рублей')
    .custom((value) => {
      if (value > 1000000) {
        throw new Error('Цена не должна превышать 1 000 000 рублей');
      }
      return true;
    }),
];

const validateSubmitOrder = [
  body('contentUrls')
    .isArray({ min: 1 })
    .withMessage('Должен быть указан хотя бы один URL контента'),
  
  body('contentUrls.*')
    .isURL()
    .withMessage('URL контента должен быть корректным'),
  
  body('platformUrls')
    .optional()
    .isArray()
    .withMessage('platformUrls должен быть массивом'),
  
  body('platformUrls.*')
    .optional()
    .isURL()
    .withMessage('URL платформы должен быть корректным'),
];

const validateRejectOrder = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Причина не должна превышать 500 символов'),
];

const validateGetOrders = [
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'in_progress', 'review', 'completed', 'cancelled'])
    .withMessage('Неверный статус заказа'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Страница должна быть положительным числом'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),
];

const validateObjectId = (req, res, next) => {
  const { orderId } = req.params;
  
  if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Неверный ID заказа', code: 'INVALID_ID' }
    });
  }
  
  next();
};

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

module.exports = {
  validateCreateOrder: [...validateCreateOrder, handleValidationErrors],
  validateSubmitOrder: [...validateSubmitOrder, handleValidationErrors],
  validateRejectOrder: [...validateRejectOrder, handleValidationErrors],
  validateGetOrders: [...validateGetOrders, handleValidationErrors],
  validateObjectId
};


