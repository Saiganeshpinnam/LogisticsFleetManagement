const axios = require('axios');

async function testPopularLocations() {
  try {
    console.log('🧪 Testing popular locations API...');

    const response = await axios.get('http://localhost:4001/api/locations/popular?limit=5', {
      timeout: 5000
    });

    console.log('✅ Popular locations API response:', JSON.stringify(response.data, null, 2));

    if (response.data.results && response.data.results.length > 0) {
      console.log('✅ Popular locations working correctly!');
      console.log('📍 Popular locations:');
      response.data.results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.main_text} (${result.source})`);
      });
    }

  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server is not running on port 4001');
    }
  }
}

testPopularLocations();
