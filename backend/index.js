const express = require('express');
const routes = require('./routes.js');
const cors = require('cors');
const config = require('./config.js');
const { connectDB } = require('./services/db.service.js');

const app = express();
app.use(express.json());
app.use(cors({ origin: config.clientUrl }));
app.use('/api', routes);

connectDB();
app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
