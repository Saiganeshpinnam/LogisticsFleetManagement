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
const locationRoutes = require('./routes/location.routes');

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:4000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:4000",
    "https://logistics-fleet-management-ten.vercel.app",
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove any undefined values
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

// Location routes
app.use('/api/locations', locationRoutes);

// -------------------- Healthcheck --------------------
app.get('/api', (req, res) => res.json({ message: 'Backend server is running ✅' }));

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('Database authentication successful');
    
    const { User } = require('./models');
    const userCount = await User.count();
    const users = await User.findAll({ attributes: ['id', 'email', 'role', 'createdAt'] });
    console.log('User count:', userCount);
    
    res.json({ 
      message: 'Database connected ✅', 
      dialect: sequelize.getDialect(),
      userCount: userCount,
      users: users.map(u => ({ 
        id: u.id, 
        email: u.email, 
        role: u.role, 
        createdAt: u.createdAt 
      })),
      dbName: process.env.DB_NAME || 'logistics_db',
      hasUrl: !!process.env.DATABASE_URL,
      storage: sequelize.options.storage || 'Not applicable'
    });
  } catch (error) {
    console.error('Database connection error details:', error);
    res.status(500).json({ 
      message: 'Database connection failed ❌', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create test user endpoint (for debugging only)
app.post('/api/create-test-user', async (req, res) => {
  try {
    const { User } = require('./models');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ where: { email: 'admin@test.com' } });
    if (existingUser) {
      return res.json({ message: 'Test user already exists', user: { email: existingUser.email, role: existingUser.role } });
    }

    // Create test user
    const testUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'Admin'
    });

    res.json({ 
      message: 'Test user created ✅', 
      user: { 
        id: testUser.id, 
        email: testUser.email, 
        role: testUser.role 
      } 
    });
  } catch (error) {
    console.error('Create test user error:', error);
    res.status(500).json({ 
      message: 'Failed to create test user ❌', 
      error: error.message 
    });
  }
});

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
  .then(async () => {
    console.log('Database synced ✅');
    console.log('Database dialect:', sequelize.getDialect());
    
    // Create default admin user if none exists
    try {
      const { User } = require('./models');
      const adminExists = await User.findOne({ where: { role: 'Admin' } });
      
      if (!adminExists) {
        const adminUser = await User.create({
          name: 'Admin User',
          email: 'admin@test.com',
          password: 'password123',
          role: 'Admin'
        });
        console.log('Default admin user created ✅');
        console.log('Admin user ID:', adminUser.id);
        console.log('Login with: admin@test.com / password123');
      } else {
        console.log('Admin user already exists ✅');
        console.log('Existing admin ID:', adminExists.id);
      }
      
      // Log total user count
      const userCount = await User.count();
      console.log(`Total users in database: ${userCount}`);
      
    } catch (err) {
      console.error('Error creating default admin:', err);
    }
  })
  .catch(err => {
    console.error('DB sync error ❌:', err);
    console.error('Error details:', err.message);
  });

module.exports = app;
