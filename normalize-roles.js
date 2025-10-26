const { sequelize, User } = require('./logistics-backend/src/models');

async function normalizeUserRoles() {
  try {
    console.log('🔄 Starting user role normalization...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find all users
    const users = await User.findAll();
    console.log(`📊 Found ${users.length} users in database`);

    let updatedCount = 0;

    for (const user of users) {
      const currentRole = user.role;
      const normalizedRole = currentRole.toLowerCase();

      if (currentRole !== normalizedRole) {
        console.log(`🔄 Updating user ${user.email}: "${currentRole}" → "${normalizedRole}"`);
        await user.update({ role: normalizedRole });
        updatedCount++;
      } else {
        console.log(`✅ User ${user.email} already has normalized role: "${currentRole}"`);
      }
    }

    console.log(`\n✅ Role normalization completed!`);
    console.log(`📊 Updated ${updatedCount} users`);
    console.log(`📊 Total users: ${users.length}`);

    // Verify normalization
    const updatedUsers = await User.findAll({ attributes: ['id', 'email', 'role'] });
    console.log('\n📋 Current user roles:');
    updatedUsers.forEach(user => {
      console.log(`   ${user.email}: "${user.role}"`);
    });

  } catch (error) {
    console.error('❌ Error normalizing roles:', error);
  } finally {
    await sequelize.close();
  }
}

normalizeUserRoles();
