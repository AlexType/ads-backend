const User = require('../models/User.model');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        company: user.company,
        notifications: user.notifications,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    let { firstName, lastName, middleName, phone, bio, notifications } = req.body;

    // Trim всех строковых полей
    if (firstName) firstName = firstName.trim();
    if (lastName) lastName = lastName.trim();
    if (middleName) middleName = middleName.trim();
    if (bio) bio = bio.trim();

    // Валидация: проверяем, что обязательные поля не пустые
    if (firstName && firstName.length < 2) {
      return res.status(400).json({
        success: false,
        error: { message: 'Имя должно быть минимум 2 символа', code: 'INVALID_FIRST_NAME' }
      });
    }

    if (lastName && lastName.length < 2) {
      return res.status(400).json({
        success: false,
        error: { message: 'Фамилия должна быть минимум 2 символа', code: 'INVALID_LAST_NAME' }
      });
    }

    if (middleName && middleName.length < 2) {
      return res.status(400).json({
        success: false,
        error: { message: 'Отчество должно быть минимум 2 символа', code: 'INVALID_MIDDLE_NAME' }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        middleName,
        phone,
        bio,
        notifications
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: user.middleName,
        phone: user.phone,
        bio: user.bio,
        notifications: user.notifications
      }
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Получаем пользователя с паролем
    const user = await User.findById(req.user.id).select('+password');

    // Проверяем текущий пароль
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: 'Неверный текущий пароль', code: 'INVALID_PASSWORD' }
      });
    }

    // Проверяем, что новый пароль отличается от старого
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Новый пароль должен отличаться от текущего', code: 'SAME_PASSWORD' }
      });
    }

    // Обновляем пароль
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Пароль успешно изменен'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword };

