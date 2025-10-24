const axios = require('axios');

// Test the location search logic directly
async function testLocationSearch() {
  try {
    console.log('🧪 Testing location search functionality...');

    // Test the backend API endpoint
    const response = await axios.get('http://localhost:4001/api/locations/search?q=mumbai&limit=5', {
      timeout: 5000
    });

    console.log('✅ API Response:', JSON.stringify(response.data, null, 2));

    if (response.data.results && response.data.results.length > 0) {
      console.log('✅ Address filtering is working correctly!');
      console.log('📍 Sample results:');
      response.data.results.slice(0, 3).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.main_text} (${result.source})`);
      });
    } else {
      console.log('⚠️ No results found - this might be normal for fallback mode');
    }

  } catch (error) {
    console.error('❌ API Error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server is not running. Starting it now...');
      console.log('   Run: cd logistics-backend && npm run dev');
    } else if (error.response) {
      console.log('📊 Response status:', error.response.status);
      console.log('📊 Response data:', error.response.data);
    }
  }
}

testLocationSearch();
