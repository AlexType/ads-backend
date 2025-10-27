const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getPayments,
  getPayment
} = require('../controllers/payment.controller');

router.get('/', authenticate, getPayments);
router.get('/:paymentId', authenticate, getPayment);

module.exports = router;

