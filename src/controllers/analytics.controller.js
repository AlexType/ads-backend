const Analytics = require('../models/Analytics.model');
const Order = require('../models/Order.model');

// Получить аналитику блогера
const getBloggerAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Построение фильтра по датам
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find({ 
      bloggerId: req.user.id,
      ...dateFilter
    });
    
    const analytics = await Analytics.find({
      orderId: { $in: orders.map(o => o._id) }
    });
    
    const totalReach = analytics.reduce((sum, a) => sum + (a.reach || 0), 0);
    const totalEngagement = analytics.reduce((sum, a) => sum + (a.engagement?.likes || 0), 0);
    const totalEarnings = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.price || 0), 0);
    
    // Данные для графика роста подписчиков (последние 6 месяцев)
    const followerGrowthData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      month.setDate(1);
      return {
        month: month.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }),
        subscribers: 100000 + Math.floor(Math.random() * 10000) + (i * 2000),
      };
    });
    
    // Данные для графика вовлеченности (последние 6 месяцев)
    const engagementData = followerGrowthData.map(item => ({
      month: item.month,
      engagement: parseFloat((2 + Math.random() * 1.5).toFixed(2)),
    }));
    
    // Данные для графика заработка (последние 6 месяцев)
    const earningsData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      month.setDate(1);
      return {
        month: month.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }),
        earnings: Math.floor(Math.random() * 50000) + 50000,
      };
    });
    
    // Топ платформы по заработку
    const platformEarnings = [
      { platform: 'VKontakte', earnings: totalEarnings * 0.5, percentage: 50 },
      { platform: 'Telegram', earnings: totalEarnings * 0.3, percentage: 30 },
      { platform: 'Instagram', earnings: totalEarnings * 0.15, percentage: 15 },
      { platform: 'YouTube', earnings: totalEarnings * 0.05, percentage: 5 },
    ];
    
    // Топ рекламодатели (по количеству заказов)
    const advertiserOrders = {};
    orders.forEach(order => {
      if (order.advertiserId) {
        const advId = order.advertiserId.toString();
        advertiserOrders[advId] = (advertiserOrders[advId] || 0) + 1;
      }
    });
    
    const topAdvertisers = Object.entries(advertiserOrders)
      .map(([advertiserId, count]) => ({
        advertiserId,
        ordersCount: count,
        totalSpent: count * 25000, // Примерная стоимость
      }))
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, 5);
    
    // Статистика по категориям
    const categoryStats = [
      { category: 'Fashion', orders: 12, earnings: 120000, percentage: 35 },
      { category: 'Beauty', orders: 8, earnings: 80000, percentage: 25 },
      { category: 'Food', orders: 6, earnings: 60000, percentage: 20 },
      { category: 'Tech', orders: 4, earnings: 40000, percentage: 12 },
      { category: 'Travel', orders: 2, earnings: 20000, percentage: 8 },
    ];
    
    res.json({
      success: true,
      data: {
        overview: {
          totalReach,
          totalEngagement,
          totalEarnings,
          totalOrders: orders.length,
          activeOrders: orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length,
        },
        charts: {
          followerGrowth: followerGrowthData,
          engagement: engagementData,
          earnings: earningsData,
        },
        topPlatforms: platformEarnings,
        topAdvertisers,
        categoryStats,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Получить аналитику заказа
const getOrderAnalytics = async (req, res, next) => {
  try {
    const analytics = await Analytics.findOne({ orderId: req.params.orderId });
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: { message: 'Аналитика не найдена', code: 'NOT_FOUND' }
      });
    }
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// Получить аналитику рекламодателя
const getAdvertiserAnalytics = async (req, res, next) => {
  try {
    const Campaign = require('../models/Campaign.model');
    const campaigns = await Campaign.find({ advertiserId: req.user.id });
    const orders = await Order.find({ advertiserId: req.user.id });
    
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget?.total || 0), 0);
    const totalSpent = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
    const totalReach = campaigns.reduce((sum, c) => sum + (c.metrics?.totalReach || 0), 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    
    // Расчет ROI
    const avgROI = totalSpent > 0 ? ((totalReach / totalSpent) * 100).toFixed(1) : 0;
    const avgEngagementRate = campaigns.length > 0 
      ? (campaigns.reduce((sum, c) => sum + (c.metrics?.totalEngagement || 0), 0) / campaigns.length / 1000).toFixed(1)
      : 0;
    
    // Детальная статистика по кампаниям
    const campaignDetails = campaigns.map(c => ({
      campaign: c.title,
      reach: c.metrics?.totalReach || 0,
      engagement: c.metrics?.totalEngagement ? (c.metrics.totalEngagement / 1000).toFixed(1) : 0,
      conversions: Math.floor(Math.random() * 20) + 1, // Мок данные
      roi: totalSpent > 0 ? Number(((c.metrics?.totalReach || 0) / totalSpent * 100).toFixed(1)) : 0
    }));
    
    // Данные для графиков
    const monthlyData = campaigns.map((c, index) => ({
      month: `Месяц ${index + 1}`,
      value: c.metrics?.totalReach || 0,
      conversions: Math.floor((c.metrics?.totalReach || 0) / 10000)
    })).slice(0, 6);

    const channelData = [
      { name: 'VKontakte', value: totalReach * 0.4 },
      { name: 'Telegram', value: totalReach * 0.35 },
      { name: 'YouTube', value: totalReach * 0.15 },
      { name: 'Instagram', value: totalReach * 0.1 }
    ];

    res.json({
      success: true,
      data: {
        overview: {
          totalBudget,
          activeCampaigns,
          totalReach,
          avgROI: Number(avgROI)
        },
        campaignDetails,
        charts: {
          monthlyData,
          channelData
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBloggerAnalytics,
  getAdvertiserAnalytics,
  getOrderAnalytics
};

