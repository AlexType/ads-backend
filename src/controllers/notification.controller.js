const Notification = require('../models/Notification.model');

// Получить уведомления
const getNotifications = async (req, res, next) => {
  try {
    const { read, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user.id };
    
    if (read !== undefined) {
      filter.read = read === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Отметить как прочитанное
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, userId: req.user.id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Уведомление не найдено', code: 'NOT_FOUND' }
      });
    }
    
    res.json({
      success: true,
      message: 'Уведомление отмечено как прочитанное'
    });
  } catch (error) {
    next(error);
  }
};

// Отметить все как прочитанные
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );
    
    res.json({
      success: true,
      message: 'Все уведомления отмечены как прочитанные'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};

