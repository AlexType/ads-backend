const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  advertiserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 5000
  },
  campaignType: {
    type: String,
    enum: ['product', 'service', 'brand', 'event'],
    required: true
  },
  targetAudience: {
    ageRange: {
      min: Number,
      max: Number
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'all']
    },
    interests: [String],
    locations: [String]
  },
  requirements: {
    platforms: [String],
    contentType: [String],
    minFollowers: Number,
    minEngagementRate: Number,
    deadline: Date
  },
  budget: {
    total: { type: Number, required: true },
    allocated: { type: Number, default: 0 },
    perBlogger: Number
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  startDate: Date,
  endDate: Date,
  metrics: {
    totalReach: { type: Number, default: 0 },
    totalEngagement: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    roi: { type: Number, default: 0 }
  }
}, { timestamps: true });

campaignSchema.index({ advertiserId: 1 });
campaignSchema.index({ status: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);

