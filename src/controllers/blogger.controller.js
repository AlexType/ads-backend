const Blogger = require('../models/Blogger.model');
const Order = require('../models/Order.model');

// Дашборд блогера с оптимизацией запросов
const getDashboard = async (req, res, next) => {
  try {
    const blogger = await Blogger.findOne({ userId: req.user.id });
    
    if (!blogger) {
      return res.json({
        success: true,
        data: {
          overview: {
            totalOrders: 0,
            activeOrders: 0,
            totalEarnings: 0,
            avgRating: 0
          }
        }
      });
    }

    // Оптимизированные запросы с использованием агрегации
    const [activeOrders, completedOrders] = await Promise.all([
      Order.countDocuments({ 
        bloggerId: req.user.id, 
        status: { $in: ['in_progress', 'review'] } 
      }),
      Order.aggregate([
        { $match: { bloggerId: req.user.id, status: 'completed' } },
        { $group: { _id: null, totalEarnings: { $sum: '$price' }, count: { $sum: 1 } } }
      ])
    ]);

    // Получаем последние 5 заказов отдельным запросом
    const recentOrders = await Order.find({ bloggerId: req.user.id })
      .populate('campaignId', 'title campaignType')
      .populate('advertiserId', 'firstName lastName company avatar')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const totalEarnings = completedOrders[0]?.totalEarnings || 0;
    const completedOrdersCount = completedOrders[0]?.count || 0;
    
    res.json({
      success: true,
      data: {
        overview: {
          totalOrders: blogger.totalOrders,
          activeOrders,
          totalEarnings,
          avgRating: blogger.rating
        },
        audienceGrowth: {
          currentFollowers: blogger.audienceStats?.totalFollowers || 0,
          growth: 5.2
        },
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

// Получить профиль блогера
const getProfile = async (req, res, next) => {
  try {
    const blogger = await Blogger.findOne({ userId: req.user.id })
      .populate('userId', 'firstName lastName avatar email');
    
    if (!blogger) {
      const blogger = await Blogger.create({
        userId: req.user.id,
        categories: [],
        pricing: { post: 0, story: 0, reel: 0, video: 0 },
        availabilityStatus: 'available'
      });
      await blogger.populate('userId', 'firstName lastName avatar email');
      return res.json({ success: true, data: blogger });
    }
    
    res.json({
      success: true,
      data: blogger
    });
  } catch (error) {
    next(error);
  }
};

// Обновить профиль блогера
const updateProfile = async (req, res, next) => {
  try {
    const { categories, pricing, availabilityStatus, languages } = req.body;
    
    const blogger = await Blogger.findOneAndUpdate(
      { userId: req.user.id },
      { categories, pricing, availabilityStatus, languages },
      { new: true, runValidators: true, upsert: true }
    ).populate('userId', 'firstName lastName avatar email');
    
    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      data: blogger
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getProfile, updateProfile };
