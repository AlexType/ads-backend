const express = require('express');
const router = express.Router();
const { getLanding, getServices, getContact } = require('../controllers/public.controller');
const rateLimit = require('express-rate-limit');

// Public limiter
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: { message: 'Слишком много запросов', code: 'TOO_MANY_REQUESTS' } }
});

router.get('/landing', publicLimiter, getLanding);
router.get('/services', publicLimiter, getServices);
router.get('/contact', publicLimiter, getContact);

module.exports = router;

