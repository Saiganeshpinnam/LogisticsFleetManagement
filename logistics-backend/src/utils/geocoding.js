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
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };
    } else {
      console.warn('Geocoding failed:', data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
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
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LogisticsFleetApp/1.0'
      }
    });
    
    const data = await response.json();
    
    if (data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name,
        placeId: result.place_id
      };
    }
    
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
