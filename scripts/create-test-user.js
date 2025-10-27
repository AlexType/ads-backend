require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

const createTestUser = async () => {
  try {
    // Подключаемся к MongoDB
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI не установлен в .env');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Подключено к MongoDB\n');

    // Данные пользователя
    const userData = {
      email: 'bryzgalov@example.com',
      password: 'TestPass123!', // Будет захеширован автоматически
      firstName: 'Александр',
      lastName: 'Брызгалов',
      role: 'advertiser', // Можно изменить на 'blogger'
      isActive: true,
      isVerified: true
    };

    // Проверяем, существует ли уже такой email
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log('⚠️  Пользователь с таким email уже существует');
      console.log('Email:', existingUser.email);
      console.log('ID:', existingUser._id);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Создаем пользователя
    const user = await User.create(userData);
    
    console.log('✅ Пользователь успешно создан!');
    console.log('\n📋 Информация о пользователе:');
    console.log('ID:', user._id);
    console.log('Email:', user.email);
    console.log('Имя:', user.firstName);
    console.log('Фамилия:', user.lastName);
    console.log('Роль:', user.role);
    console.log('\n🔑 Данные для входа:');
    console.log('Email: bryzgalov@example.com');
    console.log('Пароль: TestPass123!');
    
    await mongoose.connection.close();
    console.log('\n✅ Соединение закрыто');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createTestUser();


