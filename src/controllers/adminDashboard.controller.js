const User = require('../models/User.model');
const Campaign = require('../models/Campaign.model');
const Order = require('../models/Order.model');

// Дашборд админа
const getDashboard = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Основная статистика
    const [totalUsers, totalBloggers, totalAdvertisers, totalCampaigns, totalOrders] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'blogger' }),
      User.countDocuments({ role: 'advertiser' }),
      Campaign.countDocuments(),
      Order.countDocuments()
    ]);

    // Доходы
    const completedOrders = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const totalRevenue = completedOrders[0]?.total || 0;

    // Заказы по статусам
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const ordersStatusMap = ordersByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Новые пользователи за период
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const newBloggersThisMonth = await User.countDocuments({
      role: 'blogger',
      createdAt: { $gte: thirtyDaysAgo }
    });

    const newAdvertisersThisMonth = await User.countDocuments({
      role: 'advertiser',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Активность по дням (последние 30 дней)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // Последняя активность
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('advertiserId', 'firstName lastName email')
      .populate('bloggerId', 'firstName lastName email')
      .populate('campaignId', 'title');

    // Новые регистрации (последние 7 дней)
    const registrationsData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });
      
      registrationsData.push({
        date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
        count
      });
    }

    // Заказы за последние 7 дней
    const ordersData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await Order.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });
      
      ordersData.push({
        date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
        count
      });
    }

    const totalRevenueThisMonth = completedOrders[0]?.total || 0;

    res.json({
      success: true,
      data: {
        platformOverview: {
          totalUsers,
          totalBloggers,
          totalAdvertisers,
          totalCampaigns,
          totalOrders,
          totalRevenue,
          ordersByStatus: ordersStatusMap
        },
        growthMetrics: {
          newUsersThisMonth,
          newBloggersThisMonth,
          newAdvertisersThisMonth,
          activeUsers,
          growthRate: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1) : 0,
          retentionRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0
        },
        activityGraphs: {
          registrations: registrationsData,
          orders: ordersData
        },
        recentActivity: recentOrders,
        moderation: {
          pendingProfiles: await User.countDocuments({ isVerified: false }),
          pendingReviews: 0 // TODO: когда будет модель Review
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };

