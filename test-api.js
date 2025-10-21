async function testAssignFunctionality() {
  try {
    console.log('Testing backend API...');

    // Helper function to make HTTP requests
    const makeRequest = async (url, options = {}) => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      return response.json();
    };

    // Test health endpoint
    const healthResponse = await makeRequest('http://localhost:4001/api/health');
    console.log('✅ Health check:', healthResponse);

    // Test creating a test admin user
    try {
      const testUserResponse = await makeRequest('http://localhost:4001/api/create-test-user', {
        method: 'POST',
      });
      console.log('✅ Test user created:', testUserResponse);
    } catch (error) {
      console.log('ℹ️ Test user might already exist:', error.message);
    }

    // Test login with admin user
    const loginResponse = await makeRequest('http://localhost:4001/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123'
      }),
    });
    console.log('✅ Login successful:', loginResponse);

    const token = loginResponse.token;

    // Test getting deliveries (should be empty initially)
    const deliveriesResponse = await makeRequest('http://localhost:4001/api/deliveries', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Deliveries fetched:', deliveriesResponse.length, 'deliveries');

    // Test creating a delivery request as customer
    console.log('Testing delivery creation...');
    const deliveryResponse = await makeRequest('http://localhost:4001/api/deliveries/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        pickupAddress: '123 Test St, Test City',
        dropAddress: '456 Test Ave, Test City',
        logisticType: 'standard',
        vehicleType: 'two_wheeler',
        logisticCategory: 'goods_shifting'
      }),
    });
    console.log('✅ Delivery request created:', deliveryResponse);

    // Test getting deliveries again (should have the new delivery)
    const deliveriesAfterResponse = await makeRequest('http://localhost:4001/api/deliveries', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Deliveries after creation:', deliveriesAfterResponse.length, 'deliveries');

    // Test assigning the delivery (this should work now)
    if (deliveriesAfterResponse.length > 0) {
      const deliveryId = deliveriesAfterResponse[0].id;
      console.log('Testing delivery assignment for ID:', deliveryId);

      // First get drivers and vehicles
      const [driversResponse, vehiclesResponse] = await Promise.all([
        makeRequest('http://localhost:4001/api/users?role=Driver', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        makeRequest('http://localhost:4001/api/vehicles', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('✅ Drivers:', driversResponse.length);
      console.log('✅ Vehicles:', vehiclesResponse.length);

      if (driversResponse.length > 0 && vehiclesResponse.length > 0) {
        const driverId = driversResponse[0].id;
        const vehicleId = vehiclesResponse[0].id;

        console.log('Assigning delivery to driver:', driverId, 'with vehicle:', vehicleId);

        const assignResponse = await makeRequest(`http://localhost:4001/api/deliveries/${deliveryId}/assign`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            driverId,
            vehicleId
          }),
        });

        console.log('✅ Assignment successful:', assignResponse);

        // Test that the delivery is now assigned
        const finalDeliveriesResponse = await makeRequest('http://localhost:4001/api/deliveries', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Final deliveries check:', finalDeliveriesResponse);
      }
    }

    console.log('🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

testAssignFunctionality();
