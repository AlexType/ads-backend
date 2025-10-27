const Review = require('../models/Review.model');
const Order = require('../models/Order.model');
const Blogger = require('../models/Blogger.model');

// Оставить отзыв
const createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment, criteria } = req.body;
    
    // Проверяем, существует ли заказ
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Заказ не найден', code: 'NOT_FOUND' }
      });
    }
    
    // Проверяем права на оставление отзыва
    const isAdvertiser = req.user.id.toString() === order.advertiserId.toString();
    const isBlogger = req.user.id.toString() === order.bloggerId.toString();
    
    if (!isAdvertiser && !isBlogger) {
      return res.status(403).json({
        success: false,
        error: { message: 'Нет прав на оставление отзыва', code: 'FORBIDDEN' }
      });
    }
    
    const toUserId = isAdvertiser ? order.bloggerId : order.advertiserId;
    
    // Проверяем, не оставлен ли уже отзыв
    const existingReview = await Review.findOne({ orderId, fromUserId: req.user.id });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        error: { message: 'Отзыв уже оставлен', code: 'REVIEW_EXISTS' }
      });
    }
    
    const review = await Review.create({
      orderId,
      fromUserId: req.user.id,
      toUserId,
      rating,
      comment,
      criteria
    });
    
    // Обновляем рейтинг блогера, если отзыв для него
    if (isAdvertiser) {
      const blogger = await Blogger.findOne({ userId: order.bloggerId });
      if (blogger) {
        const allReviews = await Review.find({ toUserId: order.bloggerId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        blogger.rating = avgRating;
        await blogger.save();
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Отзыв успешно создан',
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// Получить отзывы о блогере
const getBloggerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ toUserId: req.params.bloggerId })
      .populate('fromUserId', 'firstName lastName company avatar')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getBloggerReviews
};

