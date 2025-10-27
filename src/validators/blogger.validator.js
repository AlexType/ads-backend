const { body, query, validationResult } = require('express-validator');

const validateUpdateBloggerProfile = [
  body('categories')
    .optional()
    .isArray()
    .withMessage('Категории должны быть массивом')
    .custom((value) => {
      const allowedCategories = [
        'lifestyle', 'tech', 'food', 'travel', 'fashion',
        'beauty', 'sport', 'gaming', 'music', 'business'
      ];
      
      if (value && value.some(cat => !allowedCategories.includes(cat))) {
        throw new Error('Одна или несколько категорий неверны');
      }
      
      return true;
    }),
  
  body('languages')
    .optional()
    .isArray()
    .withMessage('Языки должны быть массивом')
    .custom((value) => {
      const allowedLanguages = ['ru', 'en', 'uk', 'kz', 'by'];
      if (value && value.some(lang => !allowedLanguages.includes(lang))) {
        throw new Error('Один или несколько языков неверны');
      }
      return true;
    }),
  
  body('pricing.post')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Цена за пост должна быть от 0 до 1 000 000'),
  
  body('pricing.story')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Цена за story должна быть от 0 до 1 000 000'),
  
  body('pricing.reel')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Цена за reel должна быть от 0 до 1 000 000'),
  
  body('pricing.video')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Цена за video должна быть от 0 до 1 000 000'),
  
  body('availabilityStatus')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Неверный статус доступности'),
];

const validateSearchBloggers = [
  query('category')
    .optional()
    .matches(/^[a-zA-Z,]+$/)
    .withMessage('Категории должны быть буквами через запятую'),
  
  query('minFollowers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Минимум подписчиков должен быть неотрицательным числом'),
  
  query('maxFollowers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Максимум подписчиков должен быть неотрицательным числом'),
  
  query('platforms')
    .optional()
    .matches(/^[a-zA-Z,]+$/)
    .withMessage('Платформы должны быть буквами через запятую'),
  
  query('languages')
    .optional()
    .matches(/^[a-zA-Z,]+$/)
    .withMessage('Языки должны быть буквами через запятую'),
  
  query('minEngagementRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Engagement rate должен быть от 0 до 100'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Максимальная цена должна быть неотрицательным числом'),
  
  query('sortBy')
    .optional()
    .isIn(['followers', 'rating', 'price'])
    .withMessage('Неверный параметр сортировки'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Порядок сортировки должен быть asc или desc'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Страница должна быть положительным числом'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),
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

module.exports = {
  validateUpdateBloggerProfile: [...validateUpdateBloggerProfile, handleValidationErrors],
  validateSearchBloggers: [...validateSearchBloggers, handleValidationErrors]
};


