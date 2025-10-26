// Test script for health endpoint
async function testHealth() {
  try {
    console.log('Testing health endpoint...');

    const response = await fetch('http://localhost:4001/api/health', {
      method: 'GET',
    });

    const result = await response.json();
    console.log('Health response:', result);

    if (response.ok) {
      console.log('✅ Health check successful!');
    } else {
      console.log('❌ Health check failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
  }
}

testHealth();
