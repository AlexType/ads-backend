const Blogger = require('../models/Blogger.model');
const User = require('../models/User.model');
const SocialAccount = require('../models/SocialAccount.model');
const Review = require('../models/Review.model');

// Поиск блогеров
const searchBloggers = async (req, res, next) => {
  try {
    const {
      category,
      minFollowers,
      maxFollowers,
      platforms,
      languages,
      location,
      minEngagementRate,
      maxPrice,
      sortBy = 'rating',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;
    
    const filter = {};
    const populateOptions = { path: 'userId', select: 'firstName lastName avatar email' };
    
    // Фильтр по категориям
    if (category) {
      filter.categories = { $in: category.split(',') };
    }
    
    // Фильтр по количеству подписчиков
    if (minFollowers || maxFollowers) {
      filter['audienceStats.totalFollowers'] = {};
      if (minFollowers) filter['audienceStats.totalFollowers'].$gte = parseInt(minFollowers);
      if (maxFollowers) filter['audienceStats.totalFollowers'].$lte = parseInt(maxFollowers);
    }
    
    // Фильтр по engagement rate
    if (minEngagementRate) {
      filter['engagement.engagementRate'] = { $gte: parseFloat(minEngagementRate) };
    }
    
    // Фильтр по языкам
    if (languages) {
      filter.languages = { $in: languages.split(',') };
    }
    
    // Фильтр по локации
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    // Сортировка
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Фильтр по платформам - оптимизированная версия
    if (platforms) {
      const platformList = platforms.split(',');
      const bloggerIds = await SocialAccount.distinct('bloggerId', {
        platform: { $in: platformList }
      });
      filter._id = { $in: bloggerIds };
    }
    
    // Общая выборка с учетом всех фильтров
    let bloggers = await Blogger.find(filter)
      .populate(populateOptions)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Фильтр по цене (только если указано)
    if (maxPrice) {
      bloggers = bloggers.filter(b => {
        const prices = Object.values(b.pricing || {});
        return prices.some(p => p > 0 && p <= maxPrice);
      });
    }
    
    const total = await Blogger.countDocuments(filter);
    
    // Получаем соц. аккаунты для каждого блогера
    const bloggersWithAccounts = await Promise.all(
      bloggers.map(async (blogger) => {
        const accounts = await SocialAccount.find({ bloggerId: blogger._id })
          .select('platform username followers');
        return {
          ...blogger.toObject(),
          bloggerId: blogger._id.toString(),
          socialAccounts: accounts
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        bloggers: bloggersWithAccounts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Получить детальную информацию о блогере
const getBloggerDetails = async (req, res, next) => {
  try {
    const blogger = await Blogger.findById(req.params.bloggerId)
      .populate('userId', 'firstName lastName avatar email phone bio');
    
    if (!blogger) {
      return res.status(404).json({
        success: false,
        error: { message: 'Блогер не найден', code: 'NOT_FOUND' }
      });
    }
    
    // Получаем соц. аккаунты
    const socialAccounts = await SocialAccount.find({ bloggerId: blogger._id });
    
    // Получаем отзывы
    const reviews = await Review.find({ toUserId: blogger.userId })
      .populate('fromUserId', 'firstName lastName company avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: {
        ...blogger.toObject(),
        socialAccounts,
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchBloggers, getBloggerDetails };

