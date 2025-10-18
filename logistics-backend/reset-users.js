require('dotenv').config();

// Import the same sequelize instance used by the models
const sequelize = require('./src/config/db');

// Test the connection and reset users
async function resetUsers() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL database connection established successfully ✅');

    // Import models (they use the same sequelize instance)
    console.log('Loading models...');
    const models = require('./src/models');

    // Clear existing users
    console.log('Clearing existing users...');
    await models.User.destroy({ where: {} });
    console.log('✅ Existing users cleared');

    // Create fresh test users
    console.log('Creating fresh test users...');

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

    console.log('\n🎉 Database reset with fresh users!');
    console.log('JWT_SECRET is synchronized with current .env file');
    console.log('You can now login with any of the above credentials.');

    // Show current JWT_SECRET for verification
    const currentSecret = process.env.JWT_SECRET || 'secret';
    console.log(`\n🔑 Current JWT_SECRET: ${currentSecret.substring(0, 20)}...`);

  } catch (error) {
    console.error('❌ Database reset error:', error);
    console.error('Error details:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetUsers();
