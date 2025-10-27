const Campaign = require('../models/Campaign.model');

// Создать кампанию
const createCampaign = async (req, res, next) => {
  try {
    const campaignData = { ...req.body, advertiserId: req.user.id };
    const campaign = await Campaign.create(campaignData);
    
    res.status(201).json({
      success: true,
      message: 'Кампания успешно создана',
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// Получить все кампании пользователя с пагинацией
const getCampaigns = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { advertiserId: req.user.id };
    
    if (status) {
      filter.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const campaigns = await Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Campaign.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        campaigns,
        total,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Получить кампанию
const getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.campaignId,
      advertiserId: req.user.id
    });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { message: 'Кампания не найдена', code: 'NOT_FOUND' }
      });
    }
    
    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// Обновить кампанию
const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.campaignId, advertiserId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { message: 'Кампания не найдена', code: 'NOT_FOUND' }
      });
    }
    
    res.json({
      success: true,
      message: 'Кампания успешно обновлена',
      data: campaign
    });
  } catch (error) {
    next(error);
  }
};

// Удалить кампанию
const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.campaignId,
      advertiserId: req.user.id
    });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { message: 'Кампания не найдена', code: 'NOT_FOUND' }
      });
    }
    
    res.json({
      success: true,
      message: 'Кампания успешно удалена'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign
};

