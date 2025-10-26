const axios = require('axios');
const { geocodeAddress, geocodeAddressFallback } = require('../utils/geocoding');

// Comprehensive list of Indian cities, states, and popular areas with landmarks
const indianLocations = [
  // Mumbai - Major Metropolitan City with Areas and Landmarks
  'Mumbai, Maharashtra, India',
  'Mumbai Central, Mumbai, Maharashtra, India',
  'Andheri East, Mumbai, Maharashtra, India',
  'Andheri West, Mumbai, Maharashtra, India',
  'Bandra East, Mumbai, Maharashtra, India',
  'Bandra West, Mumbai, Maharashtra, India',
  'Borivali East, Mumbai, Maharashtra, India',
  'Borivali West, Mumbai, Maharashtra, India',
  'Dadar, Mumbai, Maharashtra, India',
  'Goregaon East, Mumbai, Maharashtra, India',
  'Goregaon West, Mumbai, Maharashtra, India',
  'Juhu, Mumbai, Maharashtra, India',
  'Kandivali East, Mumbai, Maharashtra, India',
  'Kandivali West, Mumbai, Maharashtra, India',
  'Lower Parel, Mumbai, Maharashtra, India',
  'Malad East, Mumbai, Maharashtra, India',
  'Malad West, Mumbai, Maharashtra, India',
  'Powai, Mumbai, Maharashtra, India',
  'Santacruz East, Mumbai, Maharashtra, India',
  'Santacruz West, Mumbai, Maharashtra, India',
  'Thane East, Mumbai, Maharashtra, India',
  'Thane West, Mumbai, Maharashtra, India',
  'Vikhroli, Mumbai, Maharashtra, India',
  'Worli, Mumbai, Maharashtra, India',
  'Kurla, Mumbai, Maharashtra, India',
  'Ghatkopar, Mumbai, Maharashtra, India',
  'Mulund, Mumbai, Maharashtra, India',
  'Chembur, Mumbai, Maharashtra, India',
  'Vile Parle, Mumbai, Maharashtra, India',
  'Khar, Mumbai, Maharashtra, India',
  'Fort, Mumbai, Maharashtra, India',
  'Colaba, Mumbai, Maharashtra, India',
  'Marine Drive, Mumbai, Maharashtra, India',
  'Nariman Point, Mumbai, Maharashtra, India',
  'BKC, Mumbai, Maharashtra, India',
  'Bandra Kurla Complex, Mumbai, Maharashtra, India',

  // Delhi/NCR - Capital Region with Areas
  'Delhi, India',
  'New Delhi, Delhi, India',
  'Connaught Place, New Delhi, Delhi, India',
  'Karol Bagh, New Delhi, Delhi, India',
  'Lajpat Nagar, New Delhi, Delhi, India',
  'South Extension, New Delhi, Delhi, India',
  'Rajouri Garden, New Delhi, Delhi, India',
  'Dwarka, New Delhi, Delhi, India',
  'Rohini, New Delhi, Delhi, India',
  'Pitampura, New Delhi, Delhi, India',
  'Janakpuri, New Delhi, Delhi, India',
  'Uttam Nagar, New Delhi, Delhi, India',
  'Vikaspuri, New Delhi, Delhi, India',
  'Paschim Vihar, New Delhi, Delhi, India',
  'Punjabi Bagh, New Delhi, Delhi, India',
  'Shalimar Bagh, New Delhi, Delhi, India',
  'Model Town, New Delhi, Delhi, India',
  'Azadpur, New Delhi, Delhi, India',
  'Kamla Nagar, New Delhi, Delhi, India',
  'Civil Lines, New Delhi, Delhi, India',
  'Old Delhi, Delhi, India',
  'Chandni Chowk, Old Delhi, Delhi, India',
  'Saket, New Delhi, Delhi, India',
  'Hauz Khas, New Delhi, Delhi, India',
  'Green Park, New Delhi, Delhi, India',
  'Nehru Place, New Delhi, Delhi, India',
  'Vasant Kunj, New Delhi, Delhi, India',
  'Vasant Vihar, New Delhi, Delhi, India',
  'Greater Kailash, New Delhi, Delhi, India',
  'Noida, Uttar Pradesh, India',
  'Gurgaon, Haryana, India',
  'Gurugram, Haryana, India',
  'Faridabad, Haryana, India',

  // Bangalore - IT Hub with Areas
  'Bangalore, Karnataka, India',
  'Bengaluru, Karnataka, India',
  'Whitefield, Bangalore, Karnataka, India',
  'Electronic City, Bangalore, Karnataka, India',
  'Marathahalli, Bangalore, Karnataka, India',
  'HSR Layout, Bangalore, Karnataka, India',
  'Indiranagar, Bangalore, Karnataka, India',
  'Koramangala, Bangalore, Karnataka, India',
  'Jayanagar, Bangalore, Karnataka, India',
  'Rajajinagar, Bangalore, Karnataka, India',
  'Malleshwaram, Bangalore, Karnataka, India',
  'Basavanagudi, Bangalore, Karnataka, India',
  'Richmond Town, Bangalore, Karnataka, India',
  'Shivajinagar, Bangalore, Karnataka, India',
  'Frazer Town, Bangalore, Karnataka, India',
  'Cox Town, Bangalore, Karnataka, India',
  'Ulsoor, Bangalore, Karnataka, India',
  'Cunningham Road, Bangalore, Karnataka, India',
  'Richmond Road, Bangalore, Karnataka, India',
  'BTM Layout, Bangalore, Karnataka, India',
  'JP Nagar, Bangalore, Karnataka, India',
  'Banashankari, Bangalore, Karnataka, India',
  'Yelahanka, Bangalore, Karnataka, India',
  'Hebbal, Bangalore, Karnataka, India',
  'Sarjapur Road, Bangalore, Karnataka, India',
  'Bellandur, Bangalore, Karnataka, India',

  // Hyderabad - Tech City with Areas and Landmarks
  'Hyderabad, Telangana, India',
  'Secunderabad, Hyderabad, Telangana, India',
  'Banjara Hills, Hyderabad, Telangana, India',
  'Jubilee Hills, Hyderabad, Telangana, India',
  'Gachibowli, Hyderabad, Telangana, India',
  'Kondapur, Hyderabad, Telangana, India',
  'Hitech City, Hyderabad, Telangana, India',
  'Madhapur, Hyderabad, Telangana, India',
  'Kukatpally, Hyderabad, Telangana, India',
  'Miyapur, Hyderabad, Telangana, India',
  'Ameerpet, Hyderabad, Telangana, India',
  'Begumpet, Hyderabad, Telangana, India',
  'Somajiguda, Hyderabad, Telangana, India',
  'Panjagutta, Hyderabad, Telangana, India',
  'Himayathnagar, Hyderabad, Telangana, India',
  'Abids, Hyderabad, Telangana, India',
  'Mehdipatnam, Hyderabad, Telangana, India',
  'Tolichowki, Hyderabad, Telangana, India',
  'Malakpet, Hyderabad, Telangana, India',
  'Dilsukhnagar, Hyderabad, Telangana, India',
  'LB Nagar, Hyderabad, Telangana, India',
  'Uppal, Hyderabad, Telangana, India',
  'Kompally, Hyderabad, Telangana, India',
  'Miyapur, Hyderabad, Telangana, India',
  'Financial District, Hyderabad, Telangana, India',
  'Nanakramguda, Hyderabad, Telangana, India',
  'Manikonda, Hyderabad, Telangana, India',
  'Attapur, Hyderabad, Telangana, India',
  'Kapil Kavuri Hub, Hyderabad, Telangana, India',
  'Mindspace, Hyderabad, Telangana, India',

  // Chennai - Cultural Capital with Areas
  'Chennai, Tamil Nadu, India',
  'T. Nagar, Chennai, Tamil Nadu, India',
  'Adyar, Chennai, Tamil Nadu, India',
  'Velachery, Chennai, Tamil Nadu, India',
  'Nungambakkam, Chennai, Tamil Nadu, India',
  'Egmore, Chennai, Tamil Nadu, India',
  'Mylapore, Chennai, Tamil Nadu, India',
  'Triplicane, Chennai, Tamil Nadu, India',
  'George Town, Chennai, Tamil Nadu, India',
  'Parrys, Chennai, Tamil Nadu, India',
  'Guindy, Chennai, Tamil Nadu, India',
  'Saidapet, Chennai, Tamil Nadu, India',
  'Thambaram, Chennai, Tamil Nadu, India',
  'Pallavaram, Chennai, Tamil Nadu, India',
  'Chromepet, Chennai, Tamil Nadu, India',
  'Tambaram, Chennai, Tamil Nadu, India',
  'Medavakkam, Chennai, Tamil Nadu, India',
  'Sholinganallur, Chennai, Tamil Nadu, India',
  'Perungudi, Chennai, Tamil Nadu, India',
  'Anna Nagar, Chennai, Tamil Nadu, India',
  'Porur, Chennai, Tamil Nadu, India',
  'OMR, Chennai, Tamil Nadu, India',

  // Kolkata - Cultural Hub with Areas
  'Kolkata, West Bengal, India',
  'Salt Lake City, Kolkata, West Bengal, India',
  'New Town, Kolkata, West Bengal, India',
  'Park Street, Kolkata, West Bengal, India',
  'Camac Street, Kolkata, West Bengal, India',
  'Ballygunge, Kolkata, West Bengal, India',
  'Alipore, Kolkata, West Bengal, India',
  'Tollygunge, Kolkata, West Bengal, India',
  'Jadavpur, Kolkata, West Bengal, India',
  'Garia, Kolkata, West Bengal, India',
  'Howrah, Kolkata, West Bengal, India',
  'Bhowanipore, Kolkata, West Bengal, India',
  'Lansdowne, Kolkata, West Bengal, India',
  'Minto Park, Kolkata, West Bengal, India',
  'Esplanade, Kolkata, West Bengal, India',
  'Dalhousie, Kolkata, West Bengal, India',
  'BBD Bagh, Kolkata, West Bengal, India',
  'Rajarhat, Kolkata, West Bengal, India',
  'Sector V, Kolkata, West Bengal, India',

  // Pune - Educational Hub with Areas
  'Pune, Maharashtra, India',
  'Koregaon Park, Pune, Maharashtra, India',
  'Aundh, Pune, Maharashtra, India',
  'Wakad, Pune, Maharashtra, India',
  'Hinjewadi, Pune, Maharashtra, India',
  'Baner, Pune, Maharashtra, India',
  'Pimpri, Pune, Maharashtra, India',
  'Chinchwad, Pune, Maharashtra, India',
  'Kothrud, Pune, Maharashtra, India',
  'Deccan Gymkhana, Pune, Maharashtra, India',
  'Camp, Pune, Maharashtra, India',
  'Hadapsar, Pune, Maharashtra, India',
  'Magarpatta, Pune, Maharashtra, India',
  'Wagholi, Pune, Maharashtra, India',
  'Kharadi, Pune, Maharashtra, India',
  'Viman Nagar, Pune, Maharashtra, India',
  'Yerwada, Pune, Maharashtra, India',
  'Kalyaninagar, Pune, Maharashtra, India',
  'Shivajinagar, Pune, Maharashtra, India',
  'Kalyani Nagar, Pune, Maharashtra, India',

  // Ahmedabad - Commercial Hub
  'Ahmedabad, Gujarat, India',
  'Satellite, Ahmedabad, Gujarat, India',
  'Vastrapur, Ahmedabad, Gujarat, India',
  'SG Highway, Ahmedabad, Gujarat, India',
  'Maninagar, Ahmedabad, Gujarat, India',
  'Navrangpura, Ahmedabad, Gujarat, India',

  // Jaipur - Pink City
  'Jaipur, Rajasthan, India',
  'Malviya Nagar, Jaipur, Rajasthan, India',
  'Vaishali Nagar, Jaipur, Rajasthan, India',
  'C Scheme, Jaipur, Rajasthan, India',

  // Other Major Cities
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
  'Ghaziabad, Uttar Pradesh, India',
  'Ludhiana, Punjab, India',
  'Agra, Uttar Pradesh, India',
  'Nashik, Maharashtra, India',
  'Rajkot, Gujarat, India',
  'Meerut, Uttar Pradesh, India',
  'Varanasi, Uttar Pradesh, India',
  'Srinagar, Jammu and Kashmir, India',
  'Amritsar, Punjab, India',
  'Chandigarh, India',
  'Coimbatore, Tamil Nadu, India',
  'Kochi, Kerala, India',
  'Thiruvananthapuram, Kerala, India',
  'Mysore, Karnataka, India',
  'Mangalore, Karnataka, India'
];

// Remove duplicates and filter out non-Indian locations
const uniqueIndianLocations = [...new Set(indianLocations)]
  .filter(location => location.includes('India'))
  .sort();

// Search locations based on query with enhanced Google Maps-like suggestions
exports.searchLocations = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.length < 1) {
      return res.status(400).json({
        message: 'Query parameter "q" is required and must be at least 1 character long'
      });
    }

    const searchQuery = query.toLowerCase().trim();
    const limitNum = Math.min(parseInt(limit) || 10, 50); // Increased max limit for better suggestions

    // Enhanced local results with more comprehensive Indian locations and area support
    const localResults = uniqueIndianLocations
      .filter(location => {
        const locationLower = location.toLowerCase();
        const searchQueryLower = searchQuery.toLowerCase();

        // Enhanced matching logic for areas and neighborhoods
        const locationParts = locationLower.split(',');
        const mainPart = locationParts[0]?.trim() || ''; // First part (area or city)
        const cityPart = locationParts.length > 2 ? locationParts[1]?.trim() : ''; // City if area exists
        const statePart = locationParts[locationParts.length - 2]?.trim() || ''; // State
        
        // Split search query into words for better matching
        const searchWords = searchQueryLower.split(' ').filter(w => w.length > 0);
        
        // Check for exact matches in any part
        if (mainPart === searchQueryLower) return true;
        if (cityPart === searchQueryLower) return true;
        
        // Check if main part starts with query (highest priority)
        if (mainPart.startsWith(searchQueryLower)) return true;
        
        // Check if main part contains query
        if (mainPart.includes(searchQueryLower)) return true;
        
        // Check if city part matches
        if (cityPart && (cityPart.startsWith(searchQueryLower) || cityPart.includes(searchQueryLower))) return true;
        
        // Check if any word in search matches beginning of main part
        if (searchWords.some(word => mainPart.startsWith(word))) return true;
        
        // Check if any word in search is contained in main part
        if (searchWords.some(word => mainPart.includes(word))) return true;
        
        // Check for state matches
        if (statePart && statePart.includes(searchQueryLower)) return true;
        
        // Fuzzy matching: check if all characters of query appear in order in location
        let queryIndex = 0;
        for (let i = 0; i < locationLower.length && queryIndex < searchQueryLower.length; i++) {
          if (locationLower[i] === searchQueryLower[queryIndex]) {
            queryIndex++;
          }
        }
        if (queryIndex === searchQueryLower.length) return true;
        
        // Check for any part of the location containing the query
        return locationLower.includes(searchQueryLower) ||
               locationParts.some(part => part.trim().startsWith(searchQueryLower));
      })
      .slice(0, Math.ceil(limitNum * 0.6)) // Take 60% from local results for better API integration
      .map((location, index) => {
        const locationParts = location.split(',');
        const cityName = locationParts[0]?.trim();
        const areaName = locationParts.length > 1 ? locationParts[1]?.trim() : '';
        const stateName = locationParts.length > 2 ? locationParts[2]?.trim() : '';

        return {
          id: `local_${index}`,
          description: location,
          main_text: areaName ? `${areaName}, ${cityName}` : cityName,
          secondary_text: [stateName, 'India'].filter(Boolean).join(', '),
          source: 'local',
          city: cityName,
          area: areaName,
          state: stateName,
          // Add structured data for better frontend display
          structured_formatting: {
            main_text: areaName ? `${areaName}, ${cityName}` : cityName,
            secondary_text: [stateName, 'India'].filter(Boolean).join(', ')
          }
        };
      });

    console.log(`🔍 Search for "${query}": Found ${localResults.length} local results`);

    // Enhanced API search with better Google Maps Places API integration
    let apiResults = [];
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        console.log('🌐 Using Google Maps API for search');
        // Use Google Maps Places API (Autocomplete) with enhanced parameters
        const encodedQuery = encodeURIComponent(`${query}, India`);
        const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedQuery}&types=geocode&components=country:in&key=${apiKey}`;

        const response = await axios.get(placesUrl, {
          timeout: 8000 // Increased timeout for better reliability
        });

        console.log('📡 Google Places API response:', response.data);

        if (response.data && response.data.predictions && response.data.predictions.length > 0) {
          console.log(`✅ Found ${response.data.predictions.length} Google Places results`);
          // Get place details for each prediction to get coordinates and better data
          const placeDetailsPromises = response.data.predictions
            .slice(0, Math.ceil(limitNum * 0.7)) // Take 70% from API results
            .map(async (prediction) => {
              try {
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=formatted_address,geometry,types,address_components&key=${apiKey}`;
                const detailsResponse = await axios.get(detailsUrl, { timeout: 5000 });

                if (detailsResponse.data && detailsResponse.data.result) {
                  const result = detailsResponse.data.result;
                  const addressComponents = result.address_components || [];

                  // Extract city, state, country information
                  const city = addressComponents.find(comp => comp.types.includes('locality'))?.long_name ||
                              addressComponents.find(comp => comp.types.includes('administrative_area_level_2'))?.long_name;
                  const state = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.long_name;
                  const country = addressComponents.find(comp => comp.types.includes('country'))?.long_name;

                  const mainText = prediction.structured_formatting?.main_text || city || prediction.description.split(',')[0].trim();
                  const secondaryText = prediction.structured_formatting?.secondary_text ||
                                     [state, country].filter(Boolean).join(', ') ||
                                     prediction.description.split(',').slice(1).join(',').trim();

                  return {
                    id: prediction.place_id,
                    description: result.formatted_address,
                    main_text: mainText,
                    secondary_text: secondaryText,
                    latitude: result.geometry?.location?.lat,
                    longitude: result.geometry?.location?.lng,
                    source: 'google_places',
                    place_id: prediction.place_id,
                    types: result.types || [],
                    structured_formatting: {
                      main_text: mainText,
                      secondary_text: secondaryText
                    }
                  };
                }
              } catch (detailsError) {
                console.warn('Place details error for', prediction.description, ':', detailsError.message);
                // Return basic prediction data even if details fail
                return {
                  id: prediction.place_id,
                  description: prediction.description,
                  main_text: prediction.structured_formatting?.main_text || prediction.description.split(',')[0].trim(),
                  secondary_text: prediction.structured_formatting?.secondary_text || prediction.description.split(',').slice(1).join(',').trim(),
                  source: 'google_places_basic',
                  place_id: prediction.place_id
                };
              }
              return null;
            });

          const placeDetailsResults = await Promise.allSettled(placeDetailsPromises);
          apiResults = placeDetailsResults
            .filter(result => result.status === 'fulfilled' && result.value !== null)
            .map(result => result.value);
        } else {
          console.log('❌ No Google Places results found');
        }
      } else {
        console.log('🔑 Google Maps API key not configured, using enhanced Nominatim fallback');
      }

      // Enhanced fallback to OpenStreetMap Nominatim API with better filtering
      if (apiResults.length < Math.floor(limitNum * 0.5)) {
        console.log('🌍 Using OpenStreetMap Nominatim as fallback');
        const encodedQuery = encodeURIComponent(`${query}, India`);
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=${Math.max(limitNum, 15)}&countrycodes=in&addressdetails=1&dedupe=1`;

        const fallbackResponse = await axios.get(nominatimUrl, {
          headers: {
            'User-Agent': 'LogisticsFleetApp/1.0 (contact@logistics.com)',
            'Accept-Language': 'en'
          },
          timeout: 8000
        });

        console.log('📡 Nominatim API response:', fallbackResponse.data);

        const nominatimResults = fallbackResponse.data
          .filter(item => item.display_name && item.display_name.includes('India'))
          .slice(0, limitNum - localResults.length - apiResults.length)
          .map(item => {
            const addressDetails = item.address || {};
            const city = addressDetails.city || addressDetails.town || addressDetails.village || item.display_name.split(',')[0].trim();
            const state = addressDetails.state || addressDetails.region;

            return {
              id: item.place_id,
              description: item.display_name,
              main_text: city,
              secondary_text: [state, 'India'].filter(Boolean).join(', '),
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
              source: 'nominatim_enhanced',
              place_id: item.place_id,
              structured_formatting: {
                main_text: city,
                secondary_text: [state, 'India'].filter(Boolean).join(', ')
              }
            };
          });

        console.log(`✅ Found ${nominatimResults.length} Nominatim results`);
        apiResults.push(...nominatimResults);
      }
    } catch (apiError) {
      console.warn('Enhanced location search API error:', apiError.message);
    }

    // Combine all results for final processing
    const combinedResults = [...localResults, ...apiResults];

    // Always ensure we return some results - comprehensive fallback system
    if (combinedResults.length === 0) {
      console.log('🚨 No results found, using comprehensive fallback');
      // Ultimate fallback - return popular cities that match the query
      const fallbackResults = [
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
        'Thane, Maharashtra, India'
      ]
        .filter(location => location.toLowerCase().includes(searchQuery))
        .slice(0, Math.min(limitNum, 10))
        .map((location, index) => {
          const locationParts = location.split(',');
          const cityName = locationParts[0]?.trim();
          const areaName = locationParts.length > 1 ? locationParts[1]?.trim() : '';
          const stateName = locationParts.length > 2 ? locationParts[2]?.trim() : '';

          return {
            id: `fallback_${index}`,
            description: location,
            main_text: areaName ? `${areaName}, ${cityName}` : cityName,
            secondary_text: [stateName, 'India'].filter(Boolean).join(', '),
            source: 'fallback',
            city: cityName,
            area: areaName,
            state: stateName,
            structured_formatting: {
              main_text: areaName ? `${areaName}, ${cityName}` : cityName,
              secondary_text: [stateName, 'India'].filter(Boolean).join(', ')
            }
          };
        });

      console.log(`✅ Using fallback results: ${fallbackResults.length}`);
      combinedResults.push(...fallbackResults);
    }

    console.log(`📊 Final results: ${localResults.length} local + ${apiResults.length} API + fallback = ${combinedResults.length} total`);

    // Enhanced sorting for better Google Maps-like experience with area prioritization
    const sortedResults = combinedResults.sort((a, b) => {
      const aMainLower = a.main_text.toLowerCase();
      const bMainLower = b.main_text.toLowerCase();
      const queryLower = searchQuery.toLowerCase();

      // Helper function to check if result has area information
      const hasArea = (result) => result.area && result.area.trim() !== '';

      // Prioritize results with area information when searching for areas
      if (hasArea(a) && !hasArea(b)) return -1;
      if (hasArea(b) && !hasArea(a)) return 1;

      // Exact match in main text (city or area)
      if (aMainLower === queryLower && bMainLower !== queryLower) return -1;
      if (bMainLower === queryLower && aMainLower !== queryLower) return 1;

      // Area-specific matches get higher priority
      if (hasArea(a) && hasArea(b)) {
        // Both have areas - prioritize exact area matches
        if (a.area.toLowerCase() === queryLower && b.area.toLowerCase() !== queryLower) return -1;
        if (b.area.toLowerCase() === queryLower && a.area.toLowerCase() !== queryLower) return 1;

        // Prioritize area names that start with the query
        if (a.area.toLowerCase().startsWith(queryLower) && !b.area.toLowerCase().startsWith(queryLower)) return -1;
        if (b.area.toLowerCase().startsWith(queryLower) && !a.area.toLowerCase().startsWith(queryLower)) return 1;

        // Prioritize areas that contain the query
        if (a.area.toLowerCase().includes(queryLower) && !b.area.toLowerCase().includes(queryLower)) return -1;
        if (b.area.toLowerCase().includes(queryLower) && !a.area.toLowerCase().includes(queryLower)) return 1;
      }

      // Starts with query (city or area name)
      if (aMainLower.startsWith(queryLower) && !bMainLower.startsWith(queryLower)) return -1;
      if (bMainLower.startsWith(queryLower) && !aMainLower.startsWith(queryLower)) return 1;

      // Contains query
      if (aMainLower.includes(queryLower) && !bMainLower.includes(queryLower)) return -1;
      if (bMainLower.includes(queryLower) && !aMainLower.includes(queryLower)) return 1;

      // Prioritize Google Places results
      if (a.source.includes('google') && !b.source.includes('google')) return -1;
      if (b.source.includes('google') && !a.source.includes('google')) return 1;

      // Prioritize local results over fallbacks
      if (a.source === 'local' && b.source !== 'local') return -1;
      if (b.source === 'local' && a.source !== 'local') return 1;

      // Alphabetical order for same relevance
      return aMainLower.localeCompare(bMainLower);
    });

    console.log(`🎯 Returning ${sortedResults.slice(0, limitNum).length} sorted results`);

    return res.json({
      query: query,
      results: sortedResults.slice(0, limitNum),
      total: sortedResults.length,
      sources: [...new Set(sortedResults.map(r => r.source))],
      hasMore: sortedResults.length > limitNum
    });

  } catch (error) {
    console.error('Enhanced location search error:', error);
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

  console.log(`🏠 Popular locations request: limit=${limitNum}`);

  // Return most popular Indian cities and areas
  const popularCities = [
    // Major cities with their popular areas
    'Mumbai, Maharashtra, India',
    'Andheri East, Mumbai, Maharashtra, India',
    'Andheri West, Mumbai, Maharashtra, India',
    'Bandra West, Mumbai, Maharashtra, India',
    'Lower Parel, Mumbai, Maharashtra, India',
    'Powai, Mumbai, Maharashtra, India',

    'Delhi, India',
    'New Delhi, Delhi, India',
    'Connaught Place, New Delhi, Delhi, India',
    'Karol Bagh, New Delhi, Delhi, India',
    'Lajpat Nagar, New Delhi, Delhi, India',
    'Dwarka, New Delhi, Delhi, India',

    'Bangalore, Karnataka, India',
    'Whitefield, Bangalore, Karnataka, India',
    'Electronic City, Bangalore, Karnataka, India',
    'Indiranagar, Bangalore, Karnataka, India',
    'Koramangala, Bangalore, Karnataka, India',
    'HSR Layout, Bangalore, Karnataka, India',

    'Hyderabad, Telangana, India',
    'Banjara Hills, Hyderabad, Telangana, India',
    'Jubilee Hills, Hyderabad, Telangana, India',
    'Gachibowli, Hyderabad, Telangana, India',
    'Hitech City, Hyderabad, Telangana, India',
    'Kondapur, Hyderabad, Telangana, India',

    'Chennai, Tamil Nadu, India',
    'T. Nagar, Chennai, Tamil Nadu, India',
    'Adyar, Chennai, Tamil Nadu, India',
    'Velachery, Chennai, Tamil Nadu, India',
    'Nungambakkam, Chennai, Tamil Nadu, India',

    'Kolkata, West Bengal, India',
    'Salt Lake City, Kolkata, West Bengal, India',
    'Park Street, Kolkata, West Bengal, India',
    'Ballygunge, Kolkata, West Bengal, India',

    'Pune, Maharashtra, India',
    'Koregaon Park, Pune, Maharashtra, India',
    'Hinjewadi, Pune, Maharashtra, India',
    'Wakad, Pune, Maharashtra, India',
    'Aundh, Pune, Maharashtra, India',

    // Other major cities
    'Ahmedabad, Gujarat, India',
    'Jaipur, Rajasthan, India',
    'Surat, Gujarat, India',
    'Lucknow, Uttar Pradesh, India',
    'Kanpur, Uttar Pradesh, India',
    'Nagpur, Maharashtra, India',
    'Indore, Madhya Pradesh, India',
    'Thane, Maharashtra, India',
    'Bhopal, Madhya Pradesh, India',
    'Visakhapatnam, Andhra Pradesh, India'
  ].slice(0, limitNum).map((location, index) => {
    const locationParts = location.split(',');
    const cityName = locationParts[0]?.trim();
    const areaName = locationParts.length > 1 ? locationParts[1]?.trim() : '';
    const stateName = locationParts.length > 2 ? locationParts[2]?.trim() : '';

    return {
      id: `popular_${index}`,
      description: location,
      main_text: areaName ? `${areaName}, ${cityName}` : cityName,
      secondary_text: [stateName, 'India'].filter(Boolean).join(', '),
      source: 'popular',
      icon: '⭐',
      city: cityName,
      area: areaName,
      state: stateName,
      structured_formatting: {
        main_text: areaName ? `${areaName}, ${cityName}` : cityName,
        secondary_text: [stateName, 'India'].filter(Boolean).join(', ')
      }
    };
  });

  console.log(`✅ Returning ${popularCities.length} popular locations`);

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

// Geocode an address using the same service as delivery creation
exports.geocodeAddress = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        message: 'Address parameter is required'
      });
    }

    console.log(`🗺️ Geocoding address: ${address}`);

    // Use the same geocoding function as delivery creation
    const result = await geocodeAddress(address);

    if (result) {
      console.log(`✅ Geocoding successful: ${result.latitude}, ${result.longitude}`);
      return res.json({
        success: true,
        latitude: result.latitude,
        longitude: result.longitude,
        formattedAddress: result.formattedAddress,
        placeId: result.placeId
      });
    } else {
      console.log('❌ Primary geocoding failed, trying enhanced fallback');
      // Try enhanced fallback geocoding
      const fallbackResult = await geocodeAddressFallback(address);

      if (fallbackResult) {
        console.log(`✅ Enhanced fallback geocoding successful: ${fallbackResult.latitude}, ${fallbackResult.longitude}`);
        return res.json({
          success: true,
          latitude: fallbackResult.latitude,
          longitude: fallbackResult.longitude,
          formattedAddress: fallbackResult.formattedAddress,
          placeId: fallbackResult.placeId,
          fallback: true
        });
      } else {
        console.log('❌ All geocoding methods failed');
        // Return a more helpful error response
        return res.status(404).json({
          success: false,
          message: `Could not find coordinates for "${address}". Please try a more specific address or check the spelling.`,
          suggestions: [
            'Try including city and state (e.g., "Mindspace, Hyderabad, Telangana")',
            'Check for typos in the address',
            'Use a more complete address with landmarks or area names'
          ]
        });
      }
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during geocoding',
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
