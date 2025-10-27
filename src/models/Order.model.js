const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  bloggerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  advertiserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentType: {
    type: String,
    enum: ['post', 'story', 'reel', 'video', 'collaboration'],
    required: true
  },
  description: String,
  requirements: String,
  deliverable: String,
  deadline: Date,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'review', 'completed', 'cancelled'],
    default: 'pending'
  },
  paidAt: Date,
  contentUrls: [String],
  platformUrls: [String],
  reviews: {
    advertiser: {
      rating: Number,
      comment: String
    },
    blogger: {
      rating: Number,
      comment: String
    }
  }
}, { timestamps: true });

orderSchema.index({ campaignId: 1 });
orderSchema.index({ bloggerId: 1 });
orderSchema.index({ advertiserId: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);

