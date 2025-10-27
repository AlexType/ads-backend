const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('./config/cors');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: true
}));
app.use(mongoSanitize());

// Rate Limiting (более мягкие лимиты в development)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // В разработке очень большие лимиты
  message: { success: false, error: { message: 'Слишком много запросов' } },
  standardHeaders: true,
  legacyHeaders: false,
  // В development более мягкая обработка
  ...(process.env.NODE_ENV === 'development' && {
    skip: (req) => {
      // Пропускаем rate limiting для localhost в development
      return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    }
  })
});

// General Middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors);
app.use(morgan('dev'));
app.use('/api/v1', apiLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const publicRoutes = require('./routes/public.routes');
const bloggerRoutes = require('./routes/blogger.routes');
const campaignRoutes = require('./routes/campaign.routes');
const orderRoutes = require('./routes/order.routes');
const searchRoutes = require('./routes/search.routes');
const chatRoutes = require('./routes/chat.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const adminDashboardRoutes = require('./routes/adminDashboard.routes');
const reviewRoutes = require('./routes/review.routes');
const supportRoutes = require('./routes/support.routes');
const advertiserRoutes = require('./routes/advertiser.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const socialAccountRoutes = require('./routes/socialAccount.routes');
const paymentRoutes = require('./routes/payment.routes');
const recommendationsRoutes = require('./routes/recommendations.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/blogger', bloggerRoutes);
app.use('/api/v1/blogger/social-accounts', socialAccountRoutes);
app.use('/api/v1/advertiser', advertiserRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin', adminDashboardRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);

// Error Handling
app.use((err, req, res, next) => {
  logger.error(err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message || 'Внутренняя ошибка сервера',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Ресурс не найден', code: 'NOT_FOUND' }
  });
});

module.exports = app;

