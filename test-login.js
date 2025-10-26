// Test script for login endpoint
async function testLogin() {
  try {
    console.log('Testing login endpoint...');

    const response = await fetch('http://localhost:4001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    console.log('Response status:', response.status);

    const result = await response.json();
    console.log('Login response:', result);

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', result.token ? '***' : 'missing');
    } else {
      console.log('❌ Login failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
  }
}

testLogin();
