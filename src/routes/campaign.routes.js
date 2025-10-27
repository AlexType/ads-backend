const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  deleteCampaign
} = require('../controllers/campaign.controller');
const {
  validateCreateCampaign,
  validateUpdateCampaign,
  validateGetCampaigns,
  validateObjectId
} = require('../validators/campaign.validator');

router.post('/', authenticate, authorize('advertiser'), validateCreateCampaign, createCampaign);
router.get('/', authenticate, authorize('advertiser'), validateGetCampaigns, getCampaigns);
router.get('/:campaignId', authenticate, authorize('advertiser'), validateObjectId, getCampaign);
router.put('/:campaignId', authenticate, authorize('advertiser'), validateObjectId, validateUpdateCampaign, updateCampaign);
router.delete('/:campaignId', authenticate, authorize('advertiser'), validateObjectId, deleteCampaign);

module.exports = router;

