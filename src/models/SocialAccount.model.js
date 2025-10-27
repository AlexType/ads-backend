const mongoose = require('mongoose');

const socialAccountSchema = new mongoose.Schema({
  bloggerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blogger',
    required: true
  },
  platform: {
    type: String,
    enum: ['vk', 'telegram', 'tiktok', 'instagram'],
    required: true
  },
  username: {
    type: String,
    required: true
  },
  profileUrl: String,
  verified: Boolean,
  followers: Number,
  following: Number,
  postsCount: Number,
  last30Days: {
    avgLikes: Number,
    avgComments: Number,
    avgViews: Number,
    postCount: Number
  },
  integrationSettings: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
    scope: [String],
    lastSync: Date
  }
}, { timestamps: true });

socialAccountSchema.index({ bloggerId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('SocialAccount', socialAccountSchema);
