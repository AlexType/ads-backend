const SocialAccount = require('../models/SocialAccount.model');
const Blogger = require('../models/Blogger.model');

// Получить социальные аккаунты блогера
const getSocialAccounts = async (req, res, next) => {
  try {
    const blogger = await Blogger.findOne({ userId: req.user.id });
    
    if (!blogger) {
      return res.status(404).json({
        success: false,
        error: { message: 'Профиль блогера не найден', code: 'NOT_FOUND' }
      });
    }
    
    const accounts = await SocialAccount.find({ bloggerId: blogger._id });
    
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    next(error);
  }
};

// Добавить социальный аккаунт
const createSocialAccount = async (req, res, next) => {
  try {
    const { platform, username, profileUrl } = req.body;
    
    const blogger = await Blogger.findOne({ userId: req.user.id });
    
    if (!blogger) {
      return res.status(404).json({
        success: false,
        error: { message: 'Профиль блогера не найден', code: 'NOT_FOUND' }
      });
    }
    
    const account = await SocialAccount.create({
      bloggerId: blogger._id,
      platform,
      username,
      profileUrl
    });
    
    res.status(201).json({
      success: true,
      message: 'Социальный аккаунт добавлен',
      data: account
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: { message: 'Этот аккаунт уже добавлен', code: 'DUPLICATE' }
      });
    }
    next(error);
  }
};

// Синхронизировать данные соц. аккаунта
const syncSocialAccount = async (req, res, next) => {
  try {
    const account = await SocialAccount.findById(req.params.accountId);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: { message: 'Аккаунт не найден', code: 'NOT_FOUND' }
      });
    }
    
    // TODO: Интеграция с VK/Telegram API для получения данных
    account.lastSync = new Date();
    await account.save();
    
    res.json({
      success: true,
      message: 'Данные синхронизированы',
      data: account
    });
  } catch (error) {
    next(error);
  }
};

// Удалить социальный аккаунт
const deleteSocialAccount = async (req, res, next) => {
  try {
    const blogger = await Blogger.findOne({ userId: req.user.id });
    
    if (!blogger) {
      return res.status(404).json({
        success: false,
        error: { message: 'Профиль блогера не найден', code: 'NOT_FOUND' }
      });
    }
    
    const account = await SocialAccount.findOne({
      _id: req.params.accountId,
      bloggerId: blogger._id
    });
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: { message: 'Аккаунт не найден', code: 'NOT_FOUND' }
      });
    }
    
    await SocialAccount.findByIdAndDelete(req.params.accountId);
    
    res.json({
      success: true,
      message: 'Социальный аккаунт удален'
    });
  } catch (error) {
    next(error);
  }
};

// Обновить социальный аккаунт
const updateSocialAccount = async (req, res, next) => {
  try {
    const blogger = await Blogger.findOne({ userId: req.user.id });
    
    if (!blogger) {
      return res.status(404).json({
        success: false,
        error: { message: 'Профиль блогера не найден', code: 'NOT_FOUND' }
      });
    }
    
    const account = await SocialAccount.findOneAndUpdate(
      { _id: req.params.accountId, bloggerId: blogger._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: { message: 'Аккаунт не найден', code: 'NOT_FOUND' }
      });
    }
    
    res.json({
      success: true,
      message: 'Аккаунт обновлен',
      data: account
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSocialAccounts,
  createSocialAccount,
  updateSocialAccount,
  syncSocialAccount,
  deleteSocialAccount
};

