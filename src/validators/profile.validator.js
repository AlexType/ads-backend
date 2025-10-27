const { body } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = require('express-validator').validationResult(req);
  
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

const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Введите текущий пароль'),
  
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Пароль должен быть минимум 8 символов')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Пароль должен содержать заглавные, строчные буквы, цифры и специальные символы'),
  
  handleValidationErrors
];

module.exports = {
  validateChangePassword
};

