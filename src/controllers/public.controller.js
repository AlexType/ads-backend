const SiteSettings = require('../models/SiteSettings.model');
const Service = require('../models/Service.model');

// Получить данные лендинга
const getLanding = async (req, res, next) => {
  try {
    const settings = await SiteSettings.findOne({ settingsType: 'landing' });
    
    res.json({
      success: true,
      data: settings?.landingPage || {}
    });
  } catch (error) {
    next(error);
  }
};

// Получить услуги
const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ order: 1 });
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// Получить контакты
const getContact = async (req, res, next) => {
  try {
    const settings = await SiteSettings.findOne({ settingsType: 'contact' });
    
    res.json({
      success: true,
      data: settings?.contactInfo || {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLanding, getServices, getContact };

