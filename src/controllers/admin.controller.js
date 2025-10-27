const User = require('../models/User.model');
const Service = require('../models/Service.model');
const SiteSettings = require('../models/SiteSettings.model');

// Получить статистику платформы
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBloggers = await User.countDocuments({ role: 'blogger' });
    const totalAdvertisers = await User.countDocuments({ role: 'advertiser' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalBloggers,
        totalAdvertisers,
        totalAdmins
      }
    });
  } catch (error) {
    next(error);
  }
};

// Получить список админов
const getAdmins = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { role: 'admin' };
    
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const admins = await User.find(filter)
      .select('firstName lastName email isActive lastLogin createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { admins }
    });
  } catch (error) {
    next(error);
  }
};

// Создать админа
const createAdmin = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'Email уже используется', code: 'EMAIL_EXISTS' }
      });
    }
    
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'admin',
      isActive: true,
      isVerified: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Администратор успешно создан',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    next(error);
  }
};

// Обновить админа
const updateAdmin = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, isActive } = req.body;
    
    const user = await User.findOneAndUpdate(
      { _id: req.params.adminId, role: 'admin' },
      { firstName, lastName, phone, isActive },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Администратор не найден', code: 'NOT_FOUND' }
      });
    }
    
    res.json({
      success: true,
      message: 'Данные администратора обновлены',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Удалить админа
const deleteAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.adminId, role: 'admin' });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'Администратор не найден', code: 'NOT_FOUND' }
      });
    }
    
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Вы не можете удалить себя', code: 'CANNOT_DELETE_SELF' }
      });
    }
    
    await User.findByIdAndDelete(req.params.adminId);
    
    res.json({
      success: true,
      message: 'Администратор успешно удален'
    });
  } catch (error) {
    next(error);
  }
};

// Управление услугами
const getServices = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const service = await Service.create({
      ...req.body,
      createdBy: req.user.id,
      lastUpdatedBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Услуга успешно создана',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.serviceId,
      { ...req.body, lastUpdatedBy: req.user.id },
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: { message: 'Услуга не найдена', code: 'NOT_FOUND' }
      });
    }
    
    res.json({
      success: true,
      message: 'Услуга обновлена',
      data: service
    });
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.serviceId);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        error: { message: 'Услуга не найдена', code: 'NOT_FOUND' }
      });
    }
    
    res.json({ success: true, message: 'Услуга удалена' });
  } catch (error) {
    next(error);
  }
};

// Настройки сайта
const getSettings = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    // Map 'landing' to proper type for database
    const dbType = type === 'landing' ? 'landing' : type;
    
    const settings = await SiteSettings.findOne({ settingsType: dbType });
    
    if (!settings) {
      return res.json({
        success: true,
        data: {}
      });
    }
    
    // Map type to field name
    const fieldName = type === 'contact' ? 'contactInfo' : type === 'seo' ? 'seo' : type === 'landing' ? 'landingPage' : 'landingPage';
    
    res.json({
      success: true,
      data: settings[fieldName] || {}
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { type } = req.params;
    const updates = req.body;
    
    // Map type to database type and field name
    const dbType = type === 'landing' ? 'landing' : type;
    const fieldName = type === 'contact' ? 'contactInfo' : type === 'seo' ? 'seo' : type === 'landing' ? 'landingPage' : 'landingPage';
    
    const updated = await SiteSettings.findOneAndUpdate(
      { settingsType: dbType },
      { 
        settingsType: dbType,
        [fieldName]: updates,
        lastUpdatedBy: req.user.id
      },
      { new: true, upsert: true }
    );
    
    res.json({
      success: true,
      message: 'Настройки обновлены',
      data: updated[fieldName]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getServices,
  createService,
  updateService,
  deleteService,
  updateSettings,
  getSettings
};

