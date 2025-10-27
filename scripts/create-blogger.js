require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function createBlogger() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Подключение к базе данных установлено');

    // Удаление существующего пользователя
    await User.deleteOne({ email: 'blogger@example.com' });
    console.log('✅ Старый пользователь удален');

    const user = await User.create({
      email: 'blogger@example.com',
      password: 'TestPass123!', // Mongoose автоматически хеширует через pre-save hook
      firstName: 'Мария',
      lastName: 'Блогерова',
      role: 'blogger',
      phone: '+7 (999) 888-77-66',
      bio: 'Профессиональный блогер с аудиторией более 100K подписчиков',
      isActive: true,
      isVerified: true,
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    });

    console.log('\n✅ Блогер успешно создан!');
    console.log('\n📧 Данные для входа:');
    console.log('  Email:    blogger@example.com');
    console.log('  Пароль:   TestPass123!');
    console.log('  Имя:      ' + user.firstName + ' ' + user.lastName);
    console.log('  Роль:     ' + user.role);
    console.log('  Телефон:  ' + user.phone);
    console.log('  Биография: ' + user.bio);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createBlogger();


