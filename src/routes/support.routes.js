const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  createTicket,
  getTickets,
  getTicket,
  addMessage
} = require('../controllers/support.controller');

router.post('/tickets', authenticate, createTicket);
router.get('/tickets', authenticate, getTickets);
router.get('/tickets/:ticketId', authenticate, getTicket);
router.post('/tickets/:ticketId/messages', authenticate, addMessage);

module.exports = router;

