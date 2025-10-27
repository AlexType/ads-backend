const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { getDashboard, getProfile, updateProfile } = require('../controllers/blogger.controller');
const { validateUpdateBloggerProfile } = require('../validators/blogger.validator');

router.get('/dashboard', authenticate, authorize('blogger'), getDashboard);
router.get('/profile', authenticate, authorize('blogger'), getProfile);
router.put('/profile', authenticate, authorize('blogger'), validateUpdateBloggerProfile, updateProfile);

module.exports = router;
