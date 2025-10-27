const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: String,
  image: String,
  price: String,
  features: [String],
  order: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  category: String,
  metrics: {
    totalUsers: Number,
    avgRating: Number,
    successRate: Number
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);

