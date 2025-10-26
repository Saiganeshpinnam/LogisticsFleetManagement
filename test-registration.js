// Test script for registration endpoint
async function testRegistration() {
  try {
    console.log('Testing registration endpoint...');

    const response = await fetch('http://localhost:4001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'Customer'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    const result = await response.json();
    console.log('Registration response:', result);

    if (response.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    console.error('Error details:', error);
  }
}

testRegistration();
