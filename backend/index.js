const express = require('express');
const routes = require('./routes.js');
const cors = require('cors');
const config = require('./config.js');
const { connectDB } = require('./services/db.service.js');

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use('/api', routes);

connectDB();
app.listen(config.port, () => console.log(`Server running on ${config.ip}:${config.port}`));