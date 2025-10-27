const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { getDashboard } = require('../controllers/adminDashboard.controller');

router.get('/dashboard', authenticate, authorize('admin'), getDashboard);

module.exports = router;

