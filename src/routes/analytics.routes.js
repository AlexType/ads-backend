const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getBloggerAnalytics,
  getAdvertiserAnalytics,
  getOrderAnalytics
} = require('../controllers/analytics.controller');

router.get('/blogger', authenticate, authorize('blogger'), getBloggerAnalytics);
router.get('/advertiser', authenticate, authorize('advertiser'), getAdvertiserAnalytics);
router.get('/orders/:orderId', authenticate, getOrderAnalytics);

module.exports = router;

