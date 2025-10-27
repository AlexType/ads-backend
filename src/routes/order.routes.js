const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  createOrder,
  getBloggerOrders,
  getAdvertiserOrders,
  getOrder,
  acceptOrder,
  rejectOrder,
  submitOrder,
  approveOrder
} = require('../controllers/order.controller');
const {
  validateCreateOrder,
  validateSubmitOrder,
  validateRejectOrder,
  validateGetOrders,
  validateObjectId
} = require('../validators/order.validator');

router.post('/', authenticate, authorize('advertiser'), validateCreateOrder, createOrder);
router.get('/blogger', authenticate, authorize('blogger'), validateGetOrders, getBloggerOrders);
router.get('/advertiser', authenticate, authorize('advertiser'), validateGetOrders, getAdvertiserOrders);
router.get('/:orderId', authenticate, validateObjectId, getOrder);
router.post('/:orderId/accept', authenticate, authorize('blogger'), validateObjectId, acceptOrder);
router.post('/:orderId/reject', authenticate, authorize('blogger'), validateObjectId, validateRejectOrder, rejectOrder);
router.post('/:orderId/submit', authenticate, authorize('blogger'), validateObjectId, validateSubmitOrder, submitOrder);
router.post('/:orderId/approve', authenticate, authorize('advertiser'), validateObjectId, approveOrder);

module.exports = router;

