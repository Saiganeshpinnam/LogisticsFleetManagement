const axios = require('axios');

// Comprehensive list of Indian cities, states, and popular areas
const indianLocations = [
  // Major Metropolitan Cities
  'Mumbai, Maharashtra, India',
  'Delhi, India',
  'New Delhi, Delhi, India',
  'Bangalore, Karnataka, India',
  'Bengaluru, Karnataka, India',
  'Hyderabad, Telangana, India',
  'Chennai, Tamil Nadu, India',
  'Kolkata, West Bengal, India',
  'Pune, Maharashtra, India',
  'Ahmedabad, Gujarat, India',
  'Jaipur, Rajasthan, India',
  'Surat, Gujarat, India',
  'Lucknow, Uttar Pradesh, India',
  'Kanpur, Uttar Pradesh, India',
  'Nagpur, Maharashtra, India',
  'Indore, Madhya Pradesh, India',
  'Thane, Maharashtra, India',
  'Bhopal, Madhya Pradesh, India',
  'Visakhapatnam, Andhra Pradesh, India',
  'Pimpri-Chinchwad, Maharashtra, India',
  'Patna, Bihar, India',
  'Vadodara, Gujarat, India',
  'Ghaziabad, Uttar Pradesh, India',
  'Ludhiana, Punjab, India',
  'Agra, Uttar Pradesh, India',
  'Nashik, Maharashtra, India',
  'Faridabad, Haryana, India',
  'Meerut, Uttar Pradesh, India',
  'Rajkot, Gujarat, India',
  'Kalyan-Dombivali, Maharashtra, India',
  'Vasai-Virar, Maharashtra, India',
  'Varanasi, Uttar Pradesh, India',
  'Srinagar, Jammu and Kashmir, India',
  'Aurangabad, Maharashtra, India',
  'Dhanbad, Jharkhand, India',
  'Amritsar, Punjab, India',
  'Navi Mumbai, Maharashtra, India',
  'Allahabad, Uttar Pradesh, India',
  'Prayagraj, Uttar Pradesh, India',
  'Ranchi, Jharkhand, India',
  'Howrah, West Bengal, India',
  'Coimbatore, Tamil Nadu, India',
  'Jabalpur, Madhya Pradesh, India',
  'Gwalior, Madhya Pradesh, India',
  'Vijayawada, Andhra Pradesh, India',
  'Jodhpur, Rajasthan, India',
  'Madurai, Tamil Nadu, India',
  'Raipur, Chhattisgarh, India',
  'Kota, Rajasthan, India',
  'Chandigarh, India',
  'Guwahati, Assam, India',
  'Solapur, Maharashtra, India',
  'Hubli-Dharwad, Karnataka, India',
  'Bareilly, Uttar Pradesh, India',
  'Moradabad, Uttar Pradesh, India',
  'Mysore, Karnataka, India',
  'Mysuru, Karnataka, India',
  'Gurgaon, Haryana, India',
  'Gurugram, Haryana, India',
  'Aligarh, Uttar Pradesh, India',
  'Jalandhar, Punjab, India',
  'Tiruchirappalli, Tamil Nadu, India',
  'Bhubaneswar, Odisha, India',
  'Salem, Tamil Nadu, India',
  'Warangal, Telangana, India',
  'Guntur, Andhra Pradesh, India',
  'Bhiwandi, Maharashtra, India',
  'Saharanpur, Uttar Pradesh, India',
  'Gorakhpur, Uttar Pradesh, India',
  'Bikaner, Rajasthan, India',
  'Amravati, Maharashtra, India',
  'Noida, Uttar Pradesh, India',
  'Jamshedpur, Jharkhand, India',
  'Bhilai, Chhattisgarh, India',
  'Cuttack, Odisha, India',
  'Firozabad, Uttar Pradesh, India',
  'Kochi, Kerala, India',
  'Cochin, Kerala, India',
  'Ernakulam, Kerala, India',
  'Bhavnagar, Gujarat, India',
  'Dehradun, Uttarakhand, India',
  'Durgapur, West Bengal, India',
  'Asansol, West Bengal, India',
  'Rourkela, Odisha, India',
  'Nanded, Maharashtra, India',
  'Kolhapur, Maharashtra, India',
  'Ajmer, Rajasthan, India',
  'Akola, Maharashtra, India',
  'Gulbarga, Karnataka, India',
  'Jamnagar, Gujarat, India',
  'Ujjain, Madhya Pradesh, India',
  'Loni, Uttar Pradesh, India',
  'Siliguri, West Bengal, India',
  'Jhansi, Uttar Pradesh, India',
  'Ulhasnagar, Maharashtra, India',
  'Jammu, Jammu and Kashmir, India',
  'Sangli-Miraj & Kupwad, Maharashtra, India',
  'Mangalore, Karnataka, India',
  'Erode, Tamil Nadu, India',
  'Belgaum, Karnataka, India',
  'Ambattur, Tamil Nadu, India',
  'Tirunelveli, Tamil Nadu, India',
  'Malegaon, Maharashtra, India',
  'Gaya, Bihar, India',
  'Jalgaon, Maharashtra, India',
  'Udaipur, Rajasthan, India',
  'Maheshtala, West Bengal, India',
  'Tirupur, Tamil Nadu, India',
  'Davanagere, Karnataka, India',
  'Kozhikode, Kerala, India',
  'Calicut, Kerala, India',
  'Akron, Ohio, USA', // Remove this - it's not Indian
  'Kurnool, Andhra Pradesh, India',
  'Rajpur Sonarpur, West Bengal, India',
  'Rajahmundry, Andhra Pradesh, India',
  'Bokaro, Jharkhand, India',
  'South Dumdum, West Bengal, India',
  'Bellary, Karnataka, India',
  'Patiala, Punjab, India',
  'Gopalpur, Odisha, India',
  'Agartala, Tripura, India',
  'Bhagalpur, Bihar, India',
  'Muzaffarnagar, Uttar Pradesh, India',
  'Bhatpara, West Bengal, India',
  'Panihati, West Bengal, India',
  'Latur, Maharashtra, India',
  'Dhule, Maharashtra, India',
  'Rohtak, Haryana, India',
  'Korba, Chhattisgarh, India',
  'Bhilwara, Rajasthan, India',
  'Berhampur, Odisha, India',
  'Muzaffarpur, Bihar, India',
  'Ahmednagar, Maharashtra, India',
  'Mathura, Uttar Pradesh, India',
  'Kollam, Kerala, India',
  'Avadi, Tamil Nadu, India',
  'Kadapa, Andhra Pradesh, India',
  'Kamarhati, West Bengal, India',
  'Sambalpur, Odisha, India',
  'Bilaspur, Chhattisgarh, India',
  'Shahjahanpur, Uttar Pradesh, India',
  'Satara, Maharashtra, India',
  'Bijapur, Karnataka, India',
  'Rampur, Uttar Pradesh, India',
  'Shivamogga, Karnataka, India',
  'Chandrapur, Maharashtra, India',
  'Junagadh, Gujarat, India',
  'Thrissur, Kerala, India',
  'Alwar, Rajasthan, India',
  'Bardhaman, West Bengal, India',
  'Kulti, West Bengal, India',
  'Kakinada, Andhra Pradesh, India',
  'Nizamabad, Telangana, India',
  'Parbhani, Maharashtra, India',
  'Tumkur, Karnataka, India',
  'Khammam, Telangana, India',
  'Ozhukarai, Puducherry, India',
  'Bihar Sharif, Bihar, India',
  'Panipat, Haryana, India',
  'Darbhanga, Bihar, India',
  'Bally, West Bengal, India',
  'Aizawl, Mizoram, India',
  'Dewas, Madhya Pradesh, India',
  'Ichalkaranji, Maharashtra, India',
  'Karnal, Haryana, India',
  'Bathinda, Punjab, India',
  'Jalna, Maharashtra, India',
  'Eluru, Andhra Pradesh, India',
  'Kirari Suleman Nagar, Delhi, India',
  'Barabanki, Uttar Pradesh, India',
  'Purnia, Bihar, India',
  'Satna, Madhya Pradesh, India',
  'Mau, Uttar Pradesh, India',
  'Sonipat, Haryana, India',
  'Farrukhabad, Uttar Pradesh, India',
  'Sagar, Madhya Pradesh, India',
  'Rourkela, Odisha, India',
  'Durg, Chhattisgarh, India',
  'Imphal, Manipur, India',
  'Ratlam, Madhya Pradesh, India',
  'Hapur, Uttar Pradesh, India',
  'Arrah, Bihar, India',
  'Karimnagar, Telangana, India',
  'Anantapur, Andhra Pradesh, India',
  'Etawah, Uttar Pradesh, India',
  'Ambernath, Maharashtra, India',
  'North Dumdum, West Bengal, India',
  'Bharatpur, Rajasthan, India',
  'Begusarai, Bihar, India',
  'New Delhi, Delhi, India',
  'Gandhidham, Gujarat, India',
  'Baranagar, West Bengal, India',
  'Tiruvottiyur, Tamil Nadu, India',
  'Pondicherry, Puducherry, India',
  'Sikar, Rajasthan, India',
  'Thoothukudi, Tamil Nadu, India',
  'Rewa, Madhya Pradesh, India',
  'Mirzapur, Uttar Pradesh, India',
  'Raichur, Karnataka, India',
  'Pali, Rajasthan, India',
  'Ramagundam, Telangana, India',
  'Silchar, Assam, India',
  'Orai, Uttar Pradesh, India',
  'Tonk, Rajasthan, India',
  'Ramgarh, Jharkhand, India',
  'Vizianagaram, Andhra Pradesh, India',
  'Nashik, Maharashtra, India',
  'Dewas, Madhya Pradesh, India',
  'Hospet, Karnataka, India',
  'Buxar, Bihar, India',
  'Jehanabad, Bihar, India',
  'Aurangabad, Bihar, India',
  'Phusro, Jharkhand, India',
  'Adoni, Andhra Pradesh, India',
  'Tinsukia, Assam, India',
  'Machilipatnam, Andhra Pradesh, India',
  'Udupi, Karnataka, India',
  'Serampore, West Bengal, India',
  'Kozhikode, Kerala, India'
];

// Remove duplicates and filter out non-Indian locations
const uniqueIndianLocations = [...new Set(indianLocations)]
  .filter(location => location.includes('India'))
  .sort();

// Search locations based on query
exports.searchLocations = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ 
        message: 'Query parameter "q" is required and must be at least 2 characters long' 
      });
    }

    const searchQuery = query.toLowerCase().trim();
    const limitNum = Math.min(parseInt(limit) || 10, 20); // Max 20 results

    // Search in local database first for quick results
    const localResults = uniqueIndianLocations
      .filter(location => {
        const locationLower = location.toLowerCase();
        // Check if query matches city name, state name, or full address
        return locationLower.includes(searchQuery) || 
               locationLower.split(',')[0].trim().startsWith(searchQuery) ||
               locationLower.split(',').some(part => part.trim().startsWith(searchQuery));
      })
      .slice(0, Math.floor(limitNum / 2)) // Take half from local results
      .map((location, index) => ({
        id: `local_${index}`,
        description: location,
        main_text: location.split(',')[0].trim(),
        secondary_text: location.split(',').slice(1).join(',').trim(),
        source: 'local'
      }));

    // Search using OpenStreetMap Nominatim API for additional results
    let apiResults = [];
    try {
      const encodedQuery = encodeURIComponent(`${query}, India`);
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${limitNum}&countrycodes=in&addressdetails=1`;
      
      const response = await axios.get(nominatimUrl, {
        headers: {
          'User-Agent': 'LogisticsFleetApp/1.0 (contact@logistics.com)',
          'Accept-Language': 'en'
        },
        timeout: 5000 // 5 second timeout
      });

      apiResults = response.data
        .filter(item => item.display_name && item.display_name.includes('India'))
        .slice(0, limitNum - localResults.length)
        .map(item => ({
          id: item.place_id,
          description: item.display_name,
          main_text: item.name || item.display_name.split(',')[0].trim(),
          secondary_text: item.display_name.split(',').slice(1).join(',').trim(),
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          source: 'nominatim'
        }));
    } catch (apiError) {
      console.warn('Nominatim API error:', apiError.message);
      // Continue with local results only
    }

    // Combine results, prioritizing local results and removing duplicates
    const combinedResults = [...localResults];
    
    // Add API results that don't duplicate local results
    apiResults.forEach(apiResult => {
      const isDuplicate = localResults.some(localResult => 
        localResult.main_text.toLowerCase() === apiResult.main_text.toLowerCase()
      );
      if (!isDuplicate) {
        combinedResults.push(apiResult);
      }
    });

    // Sort results by relevance (exact matches first, then starts with, then contains)
    const sortedResults = combinedResults.sort((a, b) => {
      const aMainLower = a.main_text.toLowerCase();
      const bMainLower = b.main_text.toLowerCase();
      const queryLower = searchQuery.toLowerCase();

      // Exact match
      if (aMainLower === queryLower && bMainLower !== queryLower) return -1;
      if (bMainLower === queryLower && aMainLower !== queryLower) return 1;

      // Starts with query
      if (aMainLower.startsWith(queryLower) && !bMainLower.startsWith(queryLower)) return -1;
      if (bMainLower.startsWith(queryLower) && !aMainLower.startsWith(queryLower)) return 1;

      // Alphabetical order for same relevance
      return aMainLower.localeCompare(bMainLower);
    });

    return res.json({
      query: query,
      results: sortedResults.slice(0, limitNum),
      total: sortedResults.length
    });

  } catch (error) {
    console.error('Location search error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Get popular locations (for initial display or when no query)
exports.getPopularLocations = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = Math.min(parseInt(limit) || 20, 50);

    // Return most popular Indian cities
    const popularCities = [
      'Mumbai, Maharashtra, India',
      'Delhi, India',
      'Bangalore, Karnataka, India',
      'Hyderabad, Telangana, India',
      'Chennai, Tamil Nadu, India',
      'Kolkata, West Bengal, India',
      'Pune, Maharashtra, India',
      'Ahmedabad, Gujarat, India',
      'Jaipur, Rajasthan, India',
      'Surat, Gujarat, India',
      'Lucknow, Uttar Pradesh, India',
      'Kanpur, Uttar Pradesh, India',
      'Nagpur, Maharashtra, India',
      'Indore, Madhya Pradesh, India',
      'Thane, Maharashtra, India',
      'Bhopal, Madhya Pradesh, India',
      'Visakhapatnam, Andhra Pradesh, India',
      'Patna, Bihar, India',
      'Vadodara, Gujarat, India',
      'Ghaziabad, Uttar Pradesh, India'
    ].slice(0, limitNum).map((location, index) => ({
      id: `popular_${index}`,
      description: location,
      main_text: location.split(',')[0].trim(),
      secondary_text: location.split(',').slice(1).join(',').trim(),
      source: 'popular'
    }));

    return res.json({
      results: popularCities,
      total: popularCities.length
    });

  } catch (error) {
    console.error('Popular locations error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
};

// Calculate route between two points
exports.calculateRoute = async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;

    // Validate coordinates
    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        message: 'All coordinates are required: startLat, startLng, endLat, endLng'
      });
    }

    const start = [parseFloat(startLat), parseFloat(startLng)];
    const end = [parseFloat(endLat), parseFloat(endLng)];

    // Validate coordinate ranges
    if (start.some(coord => isNaN(coord)) || end.some(coord => isNaN(coord))) {
      return res.status(400).json({
        message: 'Invalid coordinates provided'
      });
    }

    try {
      // Use OSRM (Open Source Routing Machine) for route calculation
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;
      
      const response = await axios.get(osrmUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'LogisticsFleetApp/1.0'
        }
      });

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const routeData = response.data.routes[0];
        
        return res.json({
          success: true,
          route: {
            coordinates: routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]), // Convert [lng, lat] to [lat, lng]
            distance: routeData.distance, // meters
            duration: routeData.duration, // seconds
            steps: routeData.legs[0]?.steps?.map(step => ({
              instruction: step.maneuver?.instruction || 'Continue',
              distance: step.distance,
              duration: step.duration
            })) || []
          }
        });
      } else {
        // Fallback to straight line
        return res.json({
          success: true,
          route: {
            coordinates: [start, end],
            distance: calculateStraightLineDistance(start, end) * 1000, // Convert to meters
            duration: calculateStraightLineDistance(start, end) * 1000 / 15, // Assume 15 m/s average speed
            steps: [{
              instruction: 'Head straight to destination',
              distance: calculateStraightLineDistance(start, end) * 1000,
              duration: calculateStraightLineDistance(start, end) * 1000 / 15
            }],
            fallback: true
          }
        });
      }
    } catch (apiError) {
      console.warn('OSRM API error:', apiError.message);
      
      // Fallback to straight line calculation
      const distance = calculateStraightLineDistance(start, end);
      return res.json({
        success: true,
        route: {
          coordinates: [start, end],
          distance: distance * 1000, // Convert to meters
          duration: distance * 1000 / 15, // Assume 15 m/s average speed
          steps: [{
            instruction: 'Head straight to destination',
            distance: distance * 1000,
            duration: distance * 1000 / 15
          }],
          fallback: true
        }
      });
    }

  } catch (error) {
    console.error('Route calculation error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to calculate straight line distance (Haversine formula)
function calculateStraightLineDistance(pos1, pos2) {
  const R = 6371; // Earth's radius in km
  const dLat = (pos2[0] - pos1[0]) * Math.PI / 180;
  const dLon = (pos2[1] - pos1[1]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(pos1[0] * Math.PI / 180) * Math.cos(pos2[0] * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
