const axios = require('axios');

// Test role normalization in backend
async function testRoleNormalization() {
  console.log('🧪 Testing Role Normalization\n');

  // Test credentials
  const testUsers = [
    { email: 'admin@test.com', password: 'password123', expectedRole: 'admin' },
    { email: 'driver@test.com', password: 'password123', expectedRole: 'driver' },
    { email: 'customer@test.com', password: 'password123', expectedRole: 'customer' }
  ];

  for (const user of testUsers) {
    try {
      console.log(`\n🔐 Testing login for: ${user.email}`);

      const response = await axios.post('http://localhost:4001/api/auth/login', {
        email: user.email,
        password: user.password
      }, { timeout: 10000 });

      if (response.data && response.data.token) {
        console.log(`✅ Login successful for ${user.email}`);

        // Decode token to check role
        const token = response.data.token;
        const payload = JSON.parse(atob(token.split('.')[1]));

        const tokenRole = payload.role;
        console.log(`   📋 Token role: "${tokenRole}"`);
        console.log(`   🎯 Expected role: "${user.expectedRole}"`);

        if (tokenRole === user.expectedRole) {
          console.log(`   ✅ Role normalization working correctly`);
        } else {
          console.log(`   ❌ Role mismatch! Expected: ${user.expectedRole}, Got: ${tokenRole}`);
        }

        // Test user data in response
        const responseRole = response.data.user.role;
        console.log(`   📊 Response role: "${responseRole}"`);

        if (responseRole === user.expectedRole) {
          console.log(`   ✅ Response role normalization working correctly`);
        } else {
          console.log(`   ❌ Response role mismatch! Expected: ${user.expectedRole}, Got: ${responseRole}`);
        }

      } else {
        console.log(`❌ Login failed for ${user.email}`);
      }

    } catch (error) {
      console.log(`❌ Login error for ${user.email}:`, error.response?.data?.message || error.message);
    }
  }

  console.log('\n✅ Role normalization test completed!');
  console.log('\n💡 If roles are still capitalized, the database has old user records.');
  console.log('   New logins should get lowercase roles.');
  console.log('   Clear localStorage and login again to test.');
}

testRoleNormalization();
