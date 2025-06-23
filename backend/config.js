require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  db: {
    connectionString: process.env.DATABASE_URL
  },
clientUrl: process.env.CLIENT_URL || 'http://localhost:3000' 
};
