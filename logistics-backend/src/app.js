require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const trackingRoutes = require('./routes/tracking.routes');
const reportRoutes = require('./routes/report.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://logistics-fleet-management-ten.vercel.app",
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove any undefined values
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // logs requests

// -------------------- API Routes --------------------
// Auth routes
app.use('/api/auth', authRoutes);

// Vehicle routes
app.use('/api/vehicles', vehicleRoutes);

// Delivery routes
app.use('/api/deliveries', deliveryRoutes);

// Tracking routes
app.use('/api/tracking', trackingRoutes);

// Reports
app.use('/api/reports', reportRoutes);

// Users (Admin-only list)
app.use('/api/users', userRoutes);

// -------------------- Healthcheck --------------------
app.get('/api', (req, res) => res.json({ message: 'Backend server is running ✅' }));

// -------------------- 404 handler --------------------
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found ❌' });
});

// -------------------- Global error handler --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error ❌'
  });
});

// -------------------- Sync Database --------------------
sequelize.sync({ alter: true })
  .then(() => console.log('Database synced ✅'))
  .catch(err => console.error('DB sync error ❌:', err));

module.exports = app;
