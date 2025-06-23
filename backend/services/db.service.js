// backend/services/db.service.js
const { Pool } = require('pg');
const config = require('../config.js');

const pool = new Pool({
    connectionString: config.db.connectionString,
    ssl: config.db.ssl,
    family: 4 // Ưu tiên IPv4
  });

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully');
    console.log('Connection details:', config.db.connectionString);
    client.release();
  } catch (err) {
    console.error('Database connection error:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
  }
};

module.exports = { pool, connectDB };