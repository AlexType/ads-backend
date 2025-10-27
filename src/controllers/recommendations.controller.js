const Blogger = require('../models/Blogger.model');
const Campaign = require('../models/Campaign.model');
const Order = require('../models/Order.model');
const SocialAccount = require('../models/SocialAccount.model');

// Получить рекомендации блогеров
const getBloggerRecommendations = async (req, res, next) => {
  try {
    const { campaignId, category, budget, requirements } = req.query;
    
    let filter = {};
    
    // Если указана кампания, берем ее параметры
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (campaign) {
        if (campaign.categories) filter.categories = { $in: campaign.categories };
        if (campaign.targetAudience?.location) filter.location = campaign.targetAudience.location;
        
        // Фильтр по бюджету
        const maxPrice = campaign.budget?.total || budget;
        if (maxPrice) {
          const bloggersWithPrice = await Blogger.find({
            $or: [
              { 'pricing.post': { $lte: maxPrice } },
              { 'pricing.video': { $lte: maxPrice } },
              { 'pricing.story': { $lte: maxPrice } }
            ]
          });
          filter._id = { $in: bloggersWithPrice.map(b => b._id) };
        }
      }
    }
    
    // Параметры из query
    if (category) filter.categories = { $in: category.split(',') };
    if (budget && !campaignId) {
      const bloggersWithPrice = await Blogger.find({
        $or: [
          { 'pricing.post': { $lte: budget } },
          { 'pricing.video': { $lte: budget } },
          { 'pricing.story': { $lte: budget } }
        ]
      });
      filter._id = filter._id || {};
      if (!filter._id.$in) {
        filter._id.$in = bloggersWithPrice.map(b => b._id);
      } else {
        filter._id.$in = filter._id.$in.filter(id => bloggersWithPrice.find(b => b._id.equals(id)));
      }
    }
    
    // Получаем блогеров
    let bloggers = await Blogger.find(filter)
      .populate('userId', 'firstName lastName avatar')
      .sort({ rating: -1 })
      .limit(10);
    
    // Добавляем соц. аккаунты
    const recommendations = await Promise.all(
      bloggers.map(async (blogger) => {
        const accounts = await SocialAccount.find({ bloggerId: blogger._id })
          .select('platform username followers verified');
        return {
          ...blogger.toObject(),
          socialAccounts: accounts,
          matchScore: calculateMatchScore(blogger, campaignId ? await Campaign.findById(campaignId) : null)
        };
      })
    );
    
    // Сортируем по match score
    recommendations.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    res.json({
      success: true,
      data: { recommendations }
    });
  } catch (error) {
    next(error);
  }
};

// Простая функция расчета соответствия
function calculateMatchScore(blogger, campaign) {
  let score = 0;
  
  if (!campaign) return blogger.rating || 0;
  
  // Соответствие категорий
  if (campaign.categories && blogger.categories) {
    const matchingCategories = campaign.categories.filter(c => blogger.categories.includes(c));
    score += matchingCategories.length * 10;
  }
  
  // Рейтинг
  score += blogger.rating ? blogger.rating * 2 : 0;
  
  // Engagement rate
  if (blogger.engagement?.engagementRate) {
    score += blogger.engagement.engagementRate;
  }
  
  // Общее количество подписчиков
  if (blogger.audienceStats?.totalFollowers) {
    score += Math.min(blogger.audienceStats.totalFollowers / 10000, 10);
  }
  
  return score;
}

module.exports = {
  getBloggerRecommendations
};

