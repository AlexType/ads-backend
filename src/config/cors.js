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

// Production origins - берем из переменной окружения
const prodOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['https://ads-frontend-eight.vercel.app'];

// Всегда добавляем Vercel домен
const allowedOriginsConfig = [
  ...prodOrigins,
  'https://ads-frontend-eight.vercel.app',
  ...devOrigins
];

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = allowedOriginsConfig;
    
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

