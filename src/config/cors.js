const cors = require('cors');

// Development origins
const devOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

// Production origins
const prodOrigins = [
  'https://yourdomain.com',
  'https://app.yourdomain.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? prodOrigins 
      : [...prodOrigins, ...devOrigins];
    
    // Разрешить запросы без origin (мобильные приложения, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

module.exports = cors(corsOptions);

