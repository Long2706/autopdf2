// File: backend/config.js
require('dotenv').config();

module.exports = {
  port: process.env.API_PORT || 3001,
  ip: process.env.API_IP || 'localhost',
  baseUrl: process.env.API_BASE_URL || `http://localhost:3000`,
  db: {
    connectionString: process.env.DATABASE_URL
  },
  clientUrl: process.env.CLIENT_URL || `http://localhost:3000`,
  allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000']
};