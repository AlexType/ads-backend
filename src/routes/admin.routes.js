const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  getStats,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getServices,
  createService,
  updateService,
  deleteService,
  updateSettings,
  getSettings
} = require('../controllers/admin.controller');

router.get('/stats', authenticate, authorize('admin'), getStats);
router.get('/admins', authenticate, authorize('admin'), getAdmins);
router.post('/admins', authenticate, authorize('admin'), createAdmin);
router.put('/admins/:adminId', authenticate, authorize('admin'), updateAdmin);
router.delete('/admins/:adminId', authenticate, authorize('admin'), deleteAdmin);

router.get('/services', authenticate, authorize('admin'), getServices);
router.post('/services', authenticate, authorize('admin'), createService);
router.put('/services/:serviceId', authenticate, authorize('admin'), updateService);
router.delete('/services/:serviceId', authenticate, authorize('admin'), deleteService);

// Settings routes
router.get('/settings/:type', authenticate, authorize('admin'), getSettings);
router.put('/settings/:type', authenticate, authorize('admin'), updateSettings);

module.exports = router;

