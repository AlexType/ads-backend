require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../src/models/Service.model');

async function addServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Подключение к базе данных установлено');

    // Очистка существующих услуг
    await Service.deleteMany({});
    console.log('✅ Существующие услуги удалены');

    const services = [
      {
        name: 'Instagram Stories',
        description: 'Реклама в Stories Instagram с охватом до 100K подписчиков',
        category: 'social-media',
        price: '5000',
        isActive: true,
        order: 1,
      },
      {
        name: 'Instagram Post',
        description: 'Пост в ленту Instagram с органическим охватом',
        category: 'social-media',
        price: '15000',
        isActive: true,
        order: 2,
      },
      {
        name: 'Instagram Reels',
        description: 'Рекламное видео в формате Reels',
        category: 'social-media',
        price: '20000',
        isActive: true,
        order: 3,
      },
      {
        name: 'YouTube Integration',
        description: 'Обзор продукта в видео на YouTube канале',
        category: 'video',
        price: '50000',
        isActive: true,
        order: 4,
      },
      {
        name: 'YouTube Shorts',
        description: 'Короткое рекламное видео в формате Shorts',
        category: 'video',
        price: '15000',
        isActive: true,
        order: 5,
      },
      {
        name: 'YouTube Banner',
        description: 'Размещение рекламного баннера на канале',
        category: 'banner',
        price: '8000',
        isActive: true,
        order: 6,
      },
      {
        name: 'TikTok Video',
        description: 'Рекламное видео в TikTok формате',
        category: 'video',
        price: '12000',
        isActive: true,
        order: 7,
      },
      {
        name: 'Telegram Channel Post',
        description: 'Пост в Telegram канале с аудиторией от 50K',
        category: 'social-media',
        price: '10000',
        isActive: true,
        order: 8,
      },
      {
        name: 'VKontakte Post',
        description: 'Пост в сообществе ВКонтакте',
        category: 'social-media',
        price: '6000',
        isActive: true,
        order: 9,
      },
      {
        name: 'Brand Ambassadorship',
        description: 'Долгосрочное сотрудничество в качестве амбассадора бренда',
        category: 'partnership',
        price: '200000',
        isActive: true,
        order: 10,
      },
      {
        name: 'LinkedIn Article',
        description: 'Размещение рекламной статьи в LinkedIn',
        category: 'content',
        price: '18000',
        isActive: true,
        order: 11,
      },
      {
        name: 'Facebook Post',
        description: 'Рекламный пост в Facebook',
        category: 'social-media',
        price: '7000',
        isActive: true,
        order: 12,
      },
      {
        name: 'Live Streaming',
        description: 'Реклама во время прямого эфира',
        category: 'video',
        price: '25000',
        isActive: true,
        order: 13,
      },
      {
        name: 'Collaboration Package',
        description: 'Комплексный пакет услуг на несколько платформ',
        category: 'package',
        price: '100000',
        isActive: true,
        order: 14,
      },
      {
        name: 'Podcast Mention',
        description: 'Упоминание продукта в подкасте',
        category: 'audio',
        price: '30000',
        isActive: true,
        order: 15,
      },
    ];

    await Service.insertMany(services);
    console.log(`✅ Добавлено ${services.length} услуг в базу данных`);

    console.log('\n📊 Список добавленных услуг:');
    const createdServices = await Service.find().sort('order');
    createdServices.forEach((service) => {
      console.log(`  ${service.order}. ${service.name} - ${service.price}₽ (${service.category})`);
    });

    await mongoose.connection.close();
    console.log('✅ Закрыто подключение к базе данных');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addServices();
