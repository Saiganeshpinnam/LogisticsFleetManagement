const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Ensure database directory exists for SQLite
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Created database directory:', dbDir);
}

// Create SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(dbDir, 'logistics.db'),
  logging: console.log // Enable logging to see what's happening
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully ✅');

    // Check if users table exists and count users
    const { User } = require('./src/models');
    const userCount = await User.count();
    console.log('Current user count:', userCount);

    // If no users exist, create default admin
    if (userCount === 0) {
      console.log('No users found. Creating default admin user...');
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'Admin'
      });
      console.log('Default admin user created ✅');
      console.log('Login with: admin@test.com / password123');
    } else {
      console.log('Users already exist in database');
      const users = await User.findAll({ attributes: ['id', 'email', 'role'] });
      console.log('Existing users:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));
    }

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
