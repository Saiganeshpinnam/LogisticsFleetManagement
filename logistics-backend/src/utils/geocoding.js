const fetch = require('node-fetch');

// Geocode address using Google Maps Geocoding API
async function geocodeAddress(address) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('Google Maps API key not found, skipping geocoding');
      return null;
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    console.log(`🌐 Attempting Google Maps geocoding for: "${address}"`);

    const response = await fetch(url, {
      timeout: 8000 // 8 second timeout
    });

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      console.log(`✅ Google Maps geocoding successful: ${result.geometry.location.lat}, ${result.geometry.location.lng}`);
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };
    } else {
      console.warn('Google Maps geocoding failed:', data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Google Maps geocoding error:', error.message);
    return null;
  }
}

// Validate address using Google Places API
async function validateAddress(address) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found, skipping address validation');
      return { isValid: true, address }; // Allow without validation
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodedAddress}&inputtype=textquery&fields=formatted_address,geometry,place_id&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      return {
        isValid: true,
        address: candidate.formatted_address,
        latitude: candidate.geometry.location.lat,
        longitude: candidate.geometry.location.lng,
        placeId: candidate.place_id
      };
    } else {
      return {
        isValid: false,
        address,
        error: 'Address not found or invalid'
      };
    }
  } catch (error) {
    console.error('Address validation error:', error);
    return { isValid: true, address }; // Allow on error
  }
}

// Fallback geocoding using OpenStreetMap Nominatim (free but rate-limited)
async function geocodeAddressFallback(address) {
  try {
    console.log(`🌍 Attempting fallback geocoding for: "${address}"`);

    // Try multiple search variations to improve success rate
    const searchQueries = [
      `${address}, India`,
      address.replace(/[^a-zA-Z0-9\s]/g, ' ').trim(),
      address.split(' ').slice(0, 2).join(' '), // Try first 2 words
      address.split(' ')[0] // Try just first word
    ];

    for (let i = 0; i < searchQueries.length; i++) {
      const query = searchQueries[i];
      console.log(`🔍 Trying fallback query ${i + 1}: "${query}"`);

      const encodedAddress = encodeURIComponent(query);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=5&countrycodes=in&addressdetails=1&dedupe=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LogisticsFleetApp/1.0',
          'Accept-Language': 'en'
        },
        timeout: 8000
      });

      const data = await response.json();
      console.log(`📡 Fallback response for "${query}":`, data.length, 'results');

      if (data.length > 0) {
        // Filter for results in India and prefer exact matches
        const indianResults = data.filter(item =>
          item.display_name && (
            item.display_name.includes('India') ||
            (item.address && item.address.country_code === 'in')
          )
        );

        if (indianResults.length > 0) {
          // Prefer results that more closely match the original query
          const bestMatch = indianResults.sort((a, b) => {
            const aName = (a.display_name || '').toLowerCase();
            const bName = (b.display_name || '').toLowerCase();
            const queryLower = query.toLowerCase();

            // Prioritize exact matches
            if (aName.includes(queryLower) && !bName.includes(queryLower)) return -1;
            if (bName.includes(queryLower) && !aName.includes(queryLower)) return 1;

            // Prioritize city/town results over smaller areas
            const aType = a.type || '';
            const bType = b.type || '';
            if (['city', 'town'].includes(aType) && !['city', 'town'].includes(bType)) return -1;
            if (['city', 'town'].includes(bType) && !['city', 'town'].includes(aType)) return 1;

            return 0;
          })[0];

          const result = {
            latitude: parseFloat(bestMatch.lat),
            longitude: parseFloat(bestMatch.lon),
            formattedAddress: bestMatch.display_name,
            placeId: bestMatch.place_id
          };

          console.log(`✅ Fallback geocoding successful: ${result.latitude}, ${result.longitude} for "${query}"`);
          return result;
        }
      }
    }

    console.log('❌ All fallback queries failed');
    return null;
  } catch (error) {
    console.error('Fallback geocoding error:', error);
    return null;
  }
}

module.exports = {
  geocodeAddress,
  validateAddress,
  geocodeAddressFallback
};
