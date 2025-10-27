const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  reach: Number,
  impressions: Number,
  engagement: {
    likes: Number,
    comments: Number,
    shares: Number,
    views: Number
  },
  demographics: {
    age: Object,
    gender: Object,
    location: Object
  },
  clicks: Number,
  conversions: Number,
  conversionRate: Number,
  timeline: [{
    date: Date,
    reach: Number,
    engagement: Number
  }],
  collectedAt: Date
}, { timestamps: true });

analyticsSchema.index({ orderId: 1 });
analyticsSchema.index({ collectedAt: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);

