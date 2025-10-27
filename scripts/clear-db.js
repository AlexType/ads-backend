require('dotenv').config();
const mongoose = require('mongoose');

const clearDatabase = async () => {
  try {
    // Подключаемся к MongoDB
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI не установлен в .env');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('✅ Подключено к MongoDB');

    // Получаем все коллекции
    const collections = await mongoose.connection.db.collections();
    
    console.log(`\n📋 Найдено коллекций: ${collections.length}`);
    
    // Удаляем все коллекции
    for (let collection of collections) {
      const collectionName = collection.collectionName;
      const count = await collection.countDocuments();
      
      if (count > 0) {
        await collection.deleteMany({});
        console.log(`  ✅ Очищена коллекция "${collectionName}" (${count} документов)`);
      } else {
        console.log(`  ⚠️  Коллекция "${collectionName}" уже пуста`);
      }
    }

    console.log('\n🎉 База данных полностью очищена!');
    
    await mongoose.connection.close();
    console.log('✅ Соединение закрыто');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

clearDatabase();


