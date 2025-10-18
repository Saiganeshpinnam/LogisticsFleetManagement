require('dotenv').config();

// Import the same sequelize instance used by the models
const sequelize = require('./src/config/db');

// Test the connection and create users
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully ✅');

    // Import models (they use the same sequelize instance)
    console.log('Loading models...');
    const models = require('./src/models');

    // Sync database (create tables if they don't exist)
    console.log('Syncing database...');
    await sequelize.sync({ alter: true });
    console.log('Database synced ✅');

    // Check current users
    const userCount = await models.User.count();
    console.log('Current user count:', userCount);

    // If no users exist, create default users
    if (userCount === 0) {
      console.log('No users found. Creating default users...');

      // Create admin user
      const adminUser = await models.User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'Admin'
      });
      console.log('✅ Admin user created');
      console.log('   Email: admin@test.com');
      console.log('   Password: password123');
      console.log('   Role: Admin');

      // Create driver user
      const driverUser = await models.User.create({
        name: 'Driver User',
        email: 'driver@test.com',
        password: 'password123',
        role: 'Driver'
      });
      console.log('✅ Driver user created');
      console.log('   Email: driver@test.com');
      console.log('   Password: password123');
      console.log('   Role: Driver');

      // Create customer user
      const customerUser = await models.User.create({
        name: 'Customer User',
        email: 'customer@test.com',
        password: 'password123',
        role: 'Customer'
      });
      console.log('✅ Customer user created');
      console.log('   Email: customer@test.com');
      console.log('   Password: password123');
      console.log('   Role: Customer');

      console.log('\n🎉 Database initialized with default users!');
      console.log('You can now login with any of the above credentials.');
    } else {
      console.log('Users already exist in database');
      const users = await models.User.findAll({ attributes: ['id', 'email', 'role'] });
      console.log('Existing users:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));
    }

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    console.error('Error details:', error.message);
  } finally {
    await sequelize.close();
  }
}

initializeDatabase();
