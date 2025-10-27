const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateChangePassword } = require('../validators/profile.validator');

router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);
router.post('/change-password', authenticate, validateChangePassword, changePassword);

module.exports = router;

