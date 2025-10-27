const Payment = require('../models/Payment.model');
const Order = require('../models/Order.model');

// Получить историю платежей
const getPayments = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    // Строим фильтр в зависимости от роли
    const filter = {};
    
    if (req.user.role === 'blogger') {
      // Для блогера показываем только входящие платежи
      filter.toUserId = req.user.id;
    } else if (req.user.role === 'advertiser') {
      // Для рекламодателя показываем только исходящие платежи
      filter.fromUserId = req.user.id;
    } else {
      // Для админа показываем все
      filter.$or = [
        { fromUserId: req.user.id },
        { toUserId: req.user.id }
      ];
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const payments = await Payment.find(filter)
      .populate('orderId', 'title contentType price')
      .populate('toUserId', 'firstName lastName email')
      .populate('fromUserId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    // Подсчет статистики
    const totalEarnings = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const pendingEarnings = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Данные для графика (последние 6 месяцев)
    const monthlyEarnings = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      date.setDate(1);
      
      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.createdAt);
        return paymentDate.getMonth() === date.getMonth() &&
               paymentDate.getFullYear() === date.getFullYear() &&
               p.status === 'completed';
      });
      
      return {
        month: date.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }),
        earnings: monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      };
    });
    
    res.json({
      success: true,
      data: {
        payments,
        stats: {
          totalEarnings,
          pendingEarnings,
          totalPayments: payments.length,
        },
        chart: {
          monthlyEarnings,
        },
      }
    });
  } catch (error) {
    next(error);
  }
};

// Получить платеж
const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Платеж не найден', code: 'NOT_FOUND' }
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getPayment
};

