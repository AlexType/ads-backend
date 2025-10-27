const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['order', 'message', 'campaign', 'system', 'payment'],
    required: true
  },
  title: String,
  message: String,
  actionUrl: String,
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

notificationSchema.index({ userId: 1 });
notificationSchema.index({ read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

