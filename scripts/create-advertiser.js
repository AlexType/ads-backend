require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

async function createAdvertiser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Подключение к базе данных установлено');

    // Удаление существующего пользователя
    await User.deleteOne({ email: 'advertiser@example.com' });
    console.log('✅ Старый пользователь удален');

    const user = await User.create({
      email: 'advertiser@example.com',
      password: 'TestPass123!', // Mongoose автоматически хеширует через pre-save hook
      firstName: 'Иван',
      lastName: 'Рекламодателев',
      role: 'advertiser',
      phone: '+7 (999) 999-99-99',
      isActive: true,
      isVerified: true,
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    });

    console.log('\n✅ Рекламодатель успешно создан!');
    console.log('\n📧 Данные для входа:');
    console.log('  Email:    advertiser@example.com');
    console.log('  Пароль:   TestPass123!');
    console.log('  Имя:      ' + user.firstName + ' ' + user.lastName);
    console.log('  Роль:     ' + user.role);
    console.log('  Телефон:  ' + user.phone);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAdvertiser();

