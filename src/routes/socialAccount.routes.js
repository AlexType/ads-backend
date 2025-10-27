const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getSocialAccounts,
  createSocialAccount,
  updateSocialAccount,
  syncSocialAccount,
  deleteSocialAccount
} = require('../controllers/socialAccount.controller');

router.get('/', authenticate, authorize('blogger'), getSocialAccounts);
router.post('/', authenticate, authorize('blogger'), createSocialAccount);
router.put('/:accountId', authenticate, authorize('blogger'), updateSocialAccount);
router.post('/:accountId/sync', authenticate, authorize('blogger'), syncSocialAccount);
router.delete('/:accountId', authenticate, authorize('blogger'), deleteSocialAccount);

module.exports = router;

