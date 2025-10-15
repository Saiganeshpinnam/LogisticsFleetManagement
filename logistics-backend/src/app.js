const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const trackingRoutes = require('./routes/tracking.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/deliveries', deliveryRoutes);
app.use('/tracking', trackingRoutes);
app.use('/reports', reportRoutes);

// simple healthcheck
app.get('/', (req, res) => res.json({ ok: true }));

// sync DB
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('DB sync error:', err);
});

module.exports = app;
