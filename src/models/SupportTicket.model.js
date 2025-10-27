const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: String,
  description: String,
  category: {
    type: String,
    enum: ['technical', 'billing', 'account', 'other']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent']
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    isInternal: Boolean,
    createdAt: Date
  }],
  resolvedAt: Date
}, { timestamps: true });

supportTicketSchema.index({ userId: 1 });
supportTicketSchema.index({ status: 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

