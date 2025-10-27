const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { searchBloggers, getBloggerDetails } = require('../controllers/search.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateSearchBloggers } = require('../validators/blogger.validator');

const validateObjectId = (req, res, next) => {
  const { bloggerId } = req.params;
  
  if (bloggerId && !mongoose.Types.ObjectId.isValid(bloggerId)) {
    return res.status(400).json({
      success: false,
      error: { message: 'Неверный ID блогера', code: 'INVALID_ID' }
    });
  }
  
  next();
};

router.get('/bloggers', authenticate, validateSearchBloggers, searchBloggers);
router.get('/bloggers/:bloggerId', authenticate, validateObjectId, getBloggerDetails);

module.exports = router;

