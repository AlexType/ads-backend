const Order = require('../models/Order.model');
const Campaign = require('../models/Campaign.model');
const mongoose = require('mongoose');

// Создать заказ с транзакцией для предотвращения race condition
const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { campaignId, bloggerId, contentType, description, requirements, deadline, price } = req.body;
    
    // Проверяем кампанию с блокировкой для транзакции
    const campaign = await Campaign.findById(campaignId).session(session);
    if (!campaign || campaign.advertiserId.toString() !== req.user.id.toString()) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: { message: 'Кампания не найдена', code: 'CAMPAIGN_NOT_FOUND' }
      });
    }
    
    // Проверка бюджета с учетом возможных параллельных запросов
    if (price > campaign.budget.total - campaign.budget.allocated) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: { message: 'Недостаточно бюджета в кампании', code: 'INSUFFICIENT_BUDGET' }
      });
    }
    
    // Создаем заказ в транзакции
    const order = await Order.create([{
      campaignId,
      bloggerId,
      advertiserId: req.user.id,
      contentType,
      description,
      requirements,
      deadline,
      price,
      status: 'pending'
    }], { session });
    
    // Обновляем выделенный бюджет в транзакции
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { $inc: { 'budget.allocated': price } },
      { new: true, session }
    );
    
    // Проверяем, что бюджет не превышен после обновления
    if (updatedCampaign.budget.allocated > updatedCampaign.budget.total) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: { message: 'Превышен бюджет кампании', code: 'BUDGET_EXCEEDED' }
      });
    }
    
    // Подтверждаем транзакцию
    await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      message: 'Заказ успешно создан',
      data: order[0]
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Получить заказы блогера с пагинацией
const getBloggerOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { bloggerId: req.user.id };
    
    if (status) {
      filter.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .populate('campaignId', 'title campaignType')
      .populate('advertiserId', 'firstName lastName company avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(filter);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Получить заказы рекламодателя с пагинацией
const getAdvertiserOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { advertiserId: req.user.id };
    
    if (status) {
      filter.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .populate('campaignId', 'title campaignType')
      .populate('bloggerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments(filter);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Получить заказ
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('campaignId')
      .populate('bloggerId', 'firstName lastName avatar')
      .populate('advertiserId', 'firstName lastName company');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Заказ не найден', code: 'NOT_FOUND' }
      });
    }
    
    // Проверка доступа (с учетом populate и обычного поля)
    const bloggerId = order.bloggerId?._id || order.bloggerId;
    const advertiserId = order.advertiserId?._id || order.advertiserId;
    const isAdmin = req.user.role === 'admin';
    const isParticipant = bloggerId?.toString() === req.user.id.toString() ||
                          advertiserId?.toString() === req.user.id.toString();
    
    if (!isParticipant && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { message: 'Доступ запрещен', code: 'FORBIDDEN' }
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Принять заказ (блогер)
const acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      bloggerId: req.user.id,
      status: 'pending'
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Заказ не найден или не может быть принят', code: 'NOT_FOUND' }
      });
    }
    
    order.status = 'in_progress';
    await order.save();
    
    res.json({
      success: true,
      message: 'Заказ принят',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Отклонить заказ (блогер) с транзакцией
const rejectOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { reason } = req.body;
    const order = await Order.findOne({
      _id: req.params.orderId,
      bloggerId: req.user.id,
      status: 'pending'
    }).session(session);
    
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: { message: 'Заказ не найден', code: 'NOT_FOUND' }
      });
    }
    
    order.status = 'cancelled';
    await order.save({ session });
    
    // Возвращаем бюджет в транзакции
    await Campaign.findByIdAndUpdate(
      order.campaignId,
      { $inc: { 'budget.allocated': -order.price } },
      { session }
    );
    
    await session.commitTransaction();
    
    res.json({
      success: true,
      message: 'Заказ отклонен',
      data: order
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// Отправить заказ на проверку (блогер)
const submitOrder = async (req, res, next) => {
  try {
    const { contentUrls, platformUrls } = req.body;
    
    const order = await Order.findOne({
      _id: req.params.orderId,
      bloggerId: req.user.id,
      status: 'in_progress'
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Заказ не найден', code: 'NOT_FOUND' }
      });
    }
    
    order.status = 'review';
    order.contentUrls = contentUrls;
    order.platformUrls = platformUrls;
    await order.save();
    
    res.json({
      success: true,
      message: 'Заказ отправлен на проверку',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Принять работу (рекламодатель)
const approveOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      advertiserId: req.user.id,
      status: 'review'
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { message: 'Заказ не найден', code: 'NOT_FOUND' }
      });
    }
    
    order.status = 'completed';
    order.paidAt = new Date();
    await order.save();
    
    res.json({
      success: true,
      message: 'Работа принята',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getBloggerOrders,
  getAdvertiserOrders,
  getOrder,
  acceptOrder,
  rejectOrder,
  submitOrder,
  approveOrder
};

