const { body, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const validateCreateCampaign = [
  body('title')
    .notEmpty()
    .withMessage('Название кампании обязательно')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Название должно быть от 3 до 100 символов'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Описание не должно превышать 5000 символов'),
  
  body('campaignType')
    .notEmpty()
    .withMessage('Тип кампании обязателен')
    .isIn(['product', 'service', 'brand', 'event'])
    .withMessage('Неверный тип кампании'),
  
  body('budget.total')
    .notEmpty()
    .withMessage('Бюджет обязателен')
    .isFloat({ min: 1000 })
    .withMessage('Бюджет должен быть не менее 1000 рублей'),
  
  body('targetAudience.ageRange.min')
    .optional()
    .isInt({ min: 13, max: 100 })
    .withMessage('Минимальный возраст должен быть от 13 до 100 лет'),
  
  body('targetAudience.ageRange.max')
    .optional()
    .isInt({ min: 13, max: 100 })
    .withMessage('Максимальный возраст должен быть от 13 до 100 лет'),
];

const validateUpdateCampaign = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Название должно быть от 3 до 100 символов'),
  
  body('status')
    .optional()
    .isIn(['draft', 'active', 'paused', 'completed', 'cancelled'])
    .withMessage('Неверный статус кампании'),
];

const validateGetCampaigns = [
  query('status')
    .optional()
    .isIn(['draft', 'active', 'paused', 'completed', 'cancelled'])
    .withMessage('Неверный статус'),
  
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
  const { campaignId } = req.params;
  
  if (campaignId && !mongoose.Types.ObjectId.isValid(campaignId)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Неверный ID кампании', code: 'INVALID_ID' }
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
  validateCreateCampaign: [...validateCreateCampaign, handleValidationErrors],
  validateUpdateCampaign: [...validateUpdateCampaign, handleValidationErrors],
  validateGetCampaigns: [...validateGetCampaigns, handleValidationErrors],
  validateObjectId
};


