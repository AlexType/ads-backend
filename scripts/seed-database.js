require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Blogger = require('../src/models/Blogger.model');
const Campaign = require('../src/models/Campaign.model');
const Order = require('../src/models/Order.model');
const SocialAccount = require('../src/models/SocialAccount.model');

// Тестовые данные
const testUsers = [
  // Блогеры
  { 
    email: 'blogger1@test.com', 
    password: 'Test123!Pass', 
    firstName: 'Мария', 
    lastName: 'Иванова', 
    role: 'blogger',
    phone: '+79001234567'
  },
  { 
    email: 'blogger2@test.com', 
    password: 'Test123!Pass', 
    firstName: 'Алексей', 
    lastName: 'Петров', 
    role: 'blogger',
    phone: '+79001234568'
  },
  { 
    email: 'blogger3@test.com', 
    password: 'Test123!Pass', 
    firstName: 'Елена', 
    lastName: 'Смирнова', 
    role: 'blogger',
    phone: '+79001234569'
  },
  
  // Рекламодатели
  { 
    email: 'advertiser1@test.com', 
    password: 'Test123!Pass', 
    firstName: 'Дмитрий', 
    lastName: 'Козлов', 
    role: 'advertiser',
    company: 'Brand Agency',
    phone: '+79001234570'
  },
  { 
    email: 'advertiser2@test.com', 
    password: 'Test123!Pass', 
    firstName: 'Ольга', 
    lastName: 'Новикова', 
    role: 'advertiser',
    company: 'Marketing Pro',
    phone: '+79001234571'
  },
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI не установлен в .env');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Подключено к MongoDB\n');

    // Очистка базы
    console.log('🧹 Очистка базы данных...');
    await User.deleteMany({ email: { $ne: 'bryzgalov@example.com' } });
    await Blogger.deleteMany({});
    await Campaign.deleteMany({});
    await Order.deleteMany({});
    await SocialAccount.deleteMany({});
    console.log('✅ База очищена\n');

    // Создание пользователей
    console.log('👥 Создание пользователей...');
    const users = await User.insertMany(testUsers);
    console.log(`✅ Создано ${users.length} пользователей\n`);

    // Отделяем блогеров и рекламодателей
    const bloggers = users.filter(u => u.role === 'blogger');
    const advertisers = users.filter(u => u.role === 'advertiser');

    // Создание профилей блогеров
    console.log('🎨 Создание профилей блогеров...');
    const bloggerProfiles = [
      {
        userId: bloggers[0]._id,
        categories: ['lifestyle', 'fashion'],
        languages: ['ru'],
        audienceStats: {
          totalFollowers: 125000,
          avgViews: 80000,
          avgEngagement: 12000
        },
        engagement: {
          engagementRate: 8.5,
          avgLikes: 8500,
          avgComments: 320
        },
        pricing: {
          post: 5000,
          story: 2000,
          reel: 8000,
          video: 15000
        },
        rating: 4.8,
        totalOrders: 25,
        completedOrders: 23,
        availabilityStatus: 'available'
      },
      {
        userId: bloggers[1]._id,
        categories: ['tech', 'gaming'],
        languages: ['ru', 'en'],
        audienceStats: {
          totalFollowers: 85000,
          avgViews: 60000,
          avgEngagement: 9000
        },
        engagement: {
          engagementRate: 9.2,
          avgLikes: 7200,
          avgComments: 450
        },
        pricing: {
          post: 4000,
          story: 1500,
          reel: 7000,
          video: 12000
        },
        rating: 4.6,
        totalOrders: 18,
        completedOrders: 17,
        availabilityStatus: 'available'
      },
      {
        userId: bloggers[2]._id,
        categories: ['food', 'travel'],
        languages: ['ru'],
        audienceStats: {
          totalFollowers: 200000,
          avgViews: 150000,
          avgEngagement: 20000
        },
        engagement: {
          engagementRate: 7.5,
          avgLikes: 12000,
          avgComments: 280
        },
        pricing: {
          post: 8000,
          story: 3000,
          reel: 12000,
          video: 25000
        },
        rating: 4.9,
        totalOrders: 45,
        completedOrders: 42,
        availabilityStatus: 'available'
      }
    ];

    const createdBloggers = await Blogger.insertMany(bloggerProfiles);
    console.log(`✅ Создано ${createdBloggers.length} профилей блогеров\n`);

    // Создание социальных аккаунтов
    console.log('📱 Создание социальных аккаунтов...');
    const socialAccounts = [
      {
        bloggerId: createdBloggers[0]._id,
        platform: 'vk',
        username: 'maria_ivanova',
        profileUrl: 'https://vk.com/maria_ivanova',
        followers: 125000,
        posts: 450,
        verified: true
      },
      {
        bloggerId: createdBloggers[0]._id,
        platform: 'telegram',
        username: '@maria_lifestyle',
        followers: 80000,
        posts: 320,
        verified: true
      },
      {
        bloggerId: createdBloggers[1]._id,
        platform: 'vk',
        username: 'alex_tech',
        profileUrl: 'https://vk.com/alex_tech',
        followers: 85000,
        posts: 380,
        verified: true
      },
      {
        bloggerId: createdBloggers[2]._id,
        platform: 'vk',
        username: 'elena_food',
        profileUrl: 'https://vk.com/elena_food',
        followers: 200000,
        posts: 650,
        verified: true
      }
    ];

    await SocialAccount.insertMany(socialAccounts);
    console.log(`✅ Создано ${socialAccounts.length} социальных аккаунтов\n`);

    // Создание кампаний
    console.log('📢 Создание кампаний...');
    const campaigns = [
      {
        advertiserId: advertisers[0]._id,
        title: 'Продвижение новой коллекции',
        description: 'Нужны блогеры для продвижения весенней коллекции 2025',
        campaignType: 'product',
        status: 'active',
        budget: {
          total: 300000,
          allocated: 0,
          perBlogger: 15000
        },
        targetAudience: {
          ageRange: { min: 18, max: 35 },
          gender: 'all',
          interests: ['fashion', 'lifestyle'],
          locations: ['Москва', 'Санкт-Петербург']
        },
        requirements: {
          platforms: ['vk', 'telegram'],
          contentType: ['post', 'reel'],
          minFollowers: 50000,
          minEngagementRate: 5.0
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        advertiserId: advertisers[1]._id,
        title: 'Реклама игровой платформы',
        description: 'Поиск геймеров-блогеров для рекламы новой игровой платформы',
        campaignType: 'product',
        status: 'active',
        budget: {
          total: 200000,
          allocated: 0,
          perBlogger: 10000
        },
        targetAudience: {
          ageRange: { min: 18, max: 30 },
          gender: 'all',
          interests: ['gaming', 'tech'],
          locations: ['Москва']
        },
        requirements: {
          platforms: ['vk'],
          contentType: ['post', 'video'],
          minFollowers: 30000,
          minEngagementRate: 7.0
        },
        startDate: new Date(),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdCampaigns = await Campaign.insertMany(campaigns);
    console.log(`✅ Создано ${createdCampaigns.length} кампаний\n`);

    // Создание заказов
    console.log('📋 Создание заказов...');
    const orders = [
      {
        campaignId: createdCampaigns[0]._id,
        bloggerId: bloggers[0]._id,
        advertiserId: advertisers[0]._id,
        contentType: 'post',
        description: 'Создание поста о новой коллекции',
        requirements: 'Минимум 3 фото, описание коллекции',
        price: 5000,
        status: 'pending',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        campaignId: createdCampaigns[0]._id,
        bloggerId: bloggers[2]._id,
        advertiserId: advertisers[0]._id,
        contentType: 'reel',
        description: 'Создание reels о новой коллекции',
        requirements: 'Короткое видео с демонстрацией вещей',
        price: 8000,
        status: 'accepted',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        campaignId: createdCampaigns[1]._id,
        bloggerId: bloggers[1]._id,
        advertiserId: advertisers[1]._id,
        contentType: 'post',
        description: 'Обзор игровой платформы',
        requirements: 'Детальный обзор функционала',
        price: 10000,
        status: 'completed',
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    await Order.insertMany(orders);
    console.log(`✅ Создано ${orders.length} заказов\n`);

    console.log('🎉 База данных заполнена тестовыми данными!');
    console.log('\n📊 Итоги:');
    console.log(`👥 Пользователей: ${users.length}`);
    console.log(`🎨 Профилей блогеров: ${createdBloggers.length}`);
    console.log(`📱 Социальных аккаунтов: ${socialAccounts.length}`);
    console.log(`📢 Кампаний: ${createdCampaigns.length}`);
    console.log(`📋 Заказов: ${orders.length}`);
    
    console.log('\n🔑 Данные для входа:');
    console.log('\n📝 Рекламодатели:');
    console.log('   advertiser1@test.com / Test123!Pass');
    console.log('   advertiser2@test.com / Test123!Pass');
    console.log('\n👨‍💼 Блогеры:');
    console.log('   blogger1@test.com / Test123!Pass');
    console.log('   blogger2@test.com / Test123!Pass');
    console.log('   blogger3@test.com / Test123!Pass');
    console.log('\n👤 Администратор (создан ранее):');
    console.log('   bryzgalov@example.com / TestPass123!');

    await mongoose.connection.close();
    console.log('\n✅ Соединение закрыто');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();


