const Chat = require('../models/Chat.model');
const Message = require('../models/Message.model');

// Получить все чаты пользователя
const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
      .populate('participants', 'firstName lastName avatar')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });
    
    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    next(error);
  }
};

// Получить или создать чат с пользователем
const getOrCreateChat = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    let chat = await Chat.findOne({
      participants: { $all: [req.user.id, userId] }
    }).populate('participants', 'firstName lastName avatar');
    
    if (!chat) {
      chat = await Chat.create({
        participants: [req.user.id, userId]
      });
      await chat.populate('participants', 'firstName lastName avatar');
    }
    
    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

// Получить сообщения чата
const getMessages = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user.id
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        error: { message: 'Чат не найден', code: 'NOT_FOUND' }
      });
    }
    
    const messages = await Message.find({ chatId: req.params.chatId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('senderId', 'firstName lastName avatar');
    
    res.json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    next(error);
  }
};

// Отправить сообщение
const sendMessage = async (req, res, next) => {
  try {
    const { content, type = 'text', attachments = [] } = req.body;
    const chatId = req.params.chatId;
    
    // Получаем второго участника
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user.id)) {
      return res.status(404).json({
        success: false,
        error: { message: 'Чат не найден', code: 'NOT_FOUND' }
      });
    }
    
    const recipientId = chat.participants.find(id => id.toString() !== req.user.id.toString());
    
    const message = await Message.create({
      chatId,
      senderId: req.user.id,
      recipientId,
      content,
      type,
      attachments
    });
    
    // Обновляем последнее сообщение в чате
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      $inc: { [`unreadCount.${recipientId}`]: 1 }
    });
    
    res.status(201).json({
      success: true,
      message: 'Сообщение отправлено',
      data: await Message.findById(message._id).populate('senderId', 'firstName lastName avatar')
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChats,
  getOrCreateChat,
  getMessages,
  sendMessage
};

