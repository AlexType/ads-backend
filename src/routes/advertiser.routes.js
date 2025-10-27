const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { getDashboard } = require('../controllers/advertiser.controller');

router.get('/dashboard', authenticate, authorize('advertiser'), getDashboard);

module.exports = router;

