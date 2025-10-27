const Campaign = require('../models/Campaign.model');
const Order = require('../models/Order.model');

// Дашборд рекламодателя
const getDashboard = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find({ advertiserId: req.user.id });
    const orders = await Order.find({ advertiserId: req.user.id });
    
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget.total, 0);
    const totalReach = campaigns.reduce((sum, c) => sum + (c.metrics.totalReach || 0), 0);
    
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalSpent = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
    
    // Простой расчет метрик
    const avgEngagementRate = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + (c.metrics.totalEngagement || 0), 0) / campaigns.length / 1000
      : 0;
    
    res.json({
      success: true,
      data: {
        overview: {
          totalCampaigns,
          activeCampaigns,
          totalBudget,
          totalReach
        },
        metrics: {
          avgEngagementRate: avgEngagementRate.toFixed(2),
          avgROI: totalSpent > 0 ? (totalReach / totalSpent).toFixed(2) : 0,
          totalSpent,
          avgConversionRate: 5.5
        },
        recentCampaigns: campaigns.slice(-3)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
