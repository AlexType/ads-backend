const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { createReview, getBloggerReviews } = require('../controllers/review.controller');

router.post('/', authenticate, createReview);
router.get('/bloggers/:bloggerId/reviews', getBloggerReviews);

module.exports = router;

