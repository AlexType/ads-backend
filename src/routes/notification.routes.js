const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notification.controller');

router.get('/', authenticate, getNotifications);
router.put('/:notificationId/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);

module.exports = router;

