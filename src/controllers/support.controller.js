const SupportTicket = require('../models/SupportTicket.model');

// Создать тикет
const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    
    const ticket = await SupportTicket.create({
      userId: req.user.id,
      title,
      description,
      category,
      priority
    });
    
    res.status(201).json({
      success: true,
      message: 'Тикет успешно создан',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// Получить тикеты пользователя
const getTickets = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.user.id };
    
    if (status) {
      filter.status = status;
    }
    
    const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
};

// Получить тикет
const getTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { message: 'Тикет не найден', code: 'NOT_FOUND' }
      });
    }
    
    // Проверка доступа
    if (ticket.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещен', code: 'FORBIDDEN' }
      });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// Добавить сообщение в тикет
const addMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: { message: 'Тикет не найден', code: 'NOT_FOUND' }
      });
    }
    
    ticket.messages.push({
      author: req.user.id,
      content,
      isInternal: false,
      createdAt: new Date()
    });
    
    await ticket.save();
    
    res.json({
      success: true,
      message: 'Сообщение добавлено',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  addMessage
};

