const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  settingsType: {
    type: String,
    enum: ['contact', 'seo', 'landing', 'social'],
    default: 'contact'
  },
  contactInfo: {
    email: String,
    phone: String,
    address: String,
    workingHours: String,
    socialLinks: {
      vk: String,
      telegram: String,
      instagram: String
    }
  },
  seo: {
    siteName: String,
    siteDescription: String,
    keywords: [String],
    ogImage: String
  },
  landingPage: {
    hero: {
      title: String,
      subtitle: String,
      ctaText: String,
      backgroundImage: String,
      videoUrl: String
    },
    features: [{
      title: String,
      description: String,
      icon: String,
      link: String
    }],
    testimonials: [{
      author: String,
      company: String,
      text: String,
      avatar: String,
      rating: Number
    }],
    stats: {
      totalBloggers: Number,
      totalAdvertisers: Number,
      totalOrders: Number,
      totalRevenue: Number
    },
    partners: [{
      name: String,
      logo: String,
      link: String
    }],
    faq: [{
      question: String,
      answer: String
    }]
  },
  emailTemplates: {
    welcomeBlogger: String,
    welcomeAdvertiser: String,
    orderCreated: String
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);

