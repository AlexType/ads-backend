const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  getChats,
  getOrCreateChat,
  getMessages,
  sendMessage
} = require('../controllers/chat.controller');

router.get('/', authenticate, getChats);
router.get('/with/:userId', authenticate, getOrCreateChat);
router.get('/:chatId/messages', authenticate, getMessages);
router.post('/:chatId/messages', authenticate, sendMessage);

module.exports = router;

