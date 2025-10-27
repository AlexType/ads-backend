const mongoose = require('mongoose');

const bloggerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  categories: [String],
  subcategories: [String],
  languages: [String],
  audienceStats: {
    totalFollowers: Number,
    avgAge: Number,
    genderDistribution: {
      male: Number,
      female: Number,
      other: Number
    },
    topCountries: [String],
    topCities: [String]
  },
  engagement: {
    avgLikes: Number,
    avgComments: Number,
    avgViews: Number,
    engagementRate: Number
  },
  pricing: {
    post: Number,
    story: Number,
    reel: Number,
    video: Number,
    campaign: Number
  },
  rating: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  completedOrders: { type: Number, default: 0 },
  responseTime: String,
  availabilityStatus: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  }
}, { timestamps: true });

bloggerSchema.index({ categories: 1 });

module.exports = mongoose.model('Blogger', bloggerSchema);

