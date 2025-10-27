require('dotenv').config();
const mongoose = require('mongoose');
const Campaign = require('../src/models/Campaign.model');
const User = require('../src/models/User.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Подключено к MongoDB'))
  .catch(err => {
    console.error('❌ Ошибка подключения:', err);
    process.exit(1);
  });

async function addCampaigns() {
  try {
    // Найдем первого рекламодателя
    const advertiser = await User.findOne({ role: 'advertiser' });
    
    if (!advertiser) {
      console.log('❌ Не найден рекламодатель. Сначала создайте пользователей.');
      process.exit(1);
    }

    console.log(`📢 Добавление кампаний для ${advertiser.email}...`);

    const campaigns = [
      {
        advertiserId: advertiser._id,
        title: 'Продвижение весенней коллекции 2025',
        description: 'Ищем блогеров для продвижения новой коллекции одежды. Нужны качественные фото и видео-контент.',
        campaignType: 'product',
        status: 'active',
        budget: {
          total: 300000,
          allocated: 50000,
          spent: 0
        },
        targetAudience: {
          ageRange: { min: 18, max: 35 },
          gender: 'all',
          interests: ['fashion', 'lifestyle', 'beauty'],
          locations: ['Москва', 'Санкт-Петербург']
        },
        requirements: {
          platforms: ['vk', 'telegram'],
          contentType: ['post', 'reel'],
          minFollowers: 50000,
          minEngagementRate: 5.0
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        categories: ['fashion', 'lifestyle']
      },
      {
        advertiserId: advertiser._id,
        title: 'Реклама фитнес-приложения',
        description: 'Необходимы блогеры в нише здоровья и фитнеса для продвижения мобильного приложения.',
        campaignType: 'product',
        status: 'active',
        budget: {
          total: 150000,
          allocated: 0,
          spent: 0
        },
        targetAudience: {
          ageRange: { min: 20, max: 40 },
          gender: 'all',
          interests: ['fitness', 'health', 'sport'],
          locations: ['Россия']
        },
        requirements: {
          platforms: ['vk', 'telegram', 'youtube'],
          contentType: ['post', 'video', 'story'],
          minFollowers: 30000,
          minEngagementRate: 6.0
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        categories: ['fitness', 'health']
      },
      {
        advertiserId: advertiser._id,
        title: 'Запуск онлайн-школы',
        description: 'Продвижение образовательной платформы. Ищем блогеров с аудиторией интересующейся обучением.',
        campaignType: 'product',
        status: 'paused',
        budget: {
          total: 250000,
          allocated: 100000,
          spent: 75000
        },
        targetAudience: {
          ageRange: { min: 22, max: 45 },
          gender: 'all',
          interests: ['education', 'self-development', 'business'],
          locations: ['Москва']
        },
        requirements: {
          platforms: ['vk', 'telegram'],
          contentType: ['post', 'video'],
          minFollowers: 40000,
          minEngagementRate: 5.5
        },
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        categories: ['education', 'business']
      },
      {
        advertiserId: advertiser._id,
        title: 'Продвижение косметического бренда',
        description: 'Масштабная кампания по продвижению органической косметики. Нужны beauty-блогеры.',
        campaignType: 'product',
        status: 'active',
        budget: {
          total: 500000,
          allocated: 200000,
          spent: 150000
        },
        targetAudience: {
          ageRange: { min: 18, max: 40 },
          gender: 'female',
          interests: ['beauty', 'cosmetics', 'skincare'],
          locations: ['Москва', 'Санкт-Петербург', 'Краснодар']
        },
        requirements: {
          platforms: ['vk', 'telegram'],
          contentType: ['post', 'reel'],
          minFollowers: 70000,
          minEngagementRate: 7.0
        },
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        categories: ['beauty', 'cosmetics']
      },
      {
        advertiserId: advertiser._id,
        title: 'Черновик: Новогодняя кампания 2025',
        description: 'План кампании на новогодние праздники',
        campaignType: 'product',
        status: 'draft',
        budget: {
          total: 400000,
          allocated: 0,
          spent: 0
        },
        targetAudience: {
          ageRange: { min: 18, max: 50 },
          gender: 'all',
          interests: ['holiday', 'celebration', 'gifts'],
          locations: ['Россия']
        },
        requirements: {
          platforms: ['vk'],
          contentType: ['post'],
          minFollowers: 25000,
          minEngagementRate: 4.0
        },
        startDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        categories: ['holiday', 'seasonal']
      }
    ];

    const createdCampaigns = await Campaign.insertMany(campaigns);
    console.log(`✅ Создано ${createdCampaigns.length} кампаний\n`);

    console.log('📊 Созданные кампании:');
    createdCampaigns.forEach(camp => {
      console.log(`   - ${camp.title} (${camp.status})`);
    });

    console.log('\n🎉 Кампании успешно добавлены!');
    
    await mongoose.connection.close();
    console.log('✅ Соединение закрыто');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addCampaigns();

