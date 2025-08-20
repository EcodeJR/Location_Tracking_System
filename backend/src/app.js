const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const imageRoutes = require('../routes/imageRoutes');
const adminRoutes = require('../routes/adminRoutes');
const { errorHandler } = require('../middleware/errorHandler');

const app = express();

// Configure CORS with specific options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins (add your frontend URL here)
    const allowedOrigins = [
      'http://localhost:3000', // Default React dev server
      'http://localhost:5173', // Vite dev server
      // Add production domains here when deployed
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.warn('CORS: Blocked request from origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.send({ message: 'LastSeen API running' }));

app.use(errorHandler);

module.exports = app;