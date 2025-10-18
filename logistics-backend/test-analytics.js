const axios = require('axios');

async function testDriverAnalytics() {
  try {
    console.log('Testing driver analytics endpoint...');

    // Test the endpoint (assuming backend is running on port 4000)
    const response = await axios.get('http://localhost:4000/api/users/drivers/analytics', {
      timeout: 5000
    });

    console.log('✅ Driver analytics endpoint is working!');
    console.log('Response status:', response.status);
    console.log('Sample data structure:');

    if (response.data && response.data.drivers && response.data.drivers.length > 0) {
      const firstDriver = response.data.drivers[0];
      console.log('First driver sample:', {
        name: firstDriver.name,
        totalDeliveries: firstDriver.totalDeliveries,
        deliveredDeliveries: firstDriver.deliveredDeliveries,
        successRate: firstDriver.successRate
      });
    }

    if (response.data && response.data.overall) {
      console.log('Overall stats:', {
        totalDrivers: response.data.overall.totalDrivers,
        totalDeliveries: response.data.overall.totalDeliveries,
        averageSuccessRate: response.data.overall.averageSuccessRate
      });
    }

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running. Please start it first.');
    } else if (error.response) {
      console.error('Backend returned error:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testDriverAnalytics();
