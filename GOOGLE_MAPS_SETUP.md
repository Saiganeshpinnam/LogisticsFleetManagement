# Google Maps Integration Setup

## Overview

The logistics application now includes address autocomplete functionality using Google Maps Places API. This provides users with intelligent address suggestions when entering pickup and drop locations.

## Features Added

### Frontend
- **Address Autocomplete Component**: Smart address suggestions as users type
- **Fallback Component**: Works without Google Maps API using OpenStreetMap
- **Improved UI**: Better form layout with labels and enhanced styling

### Backend
- **Geocoding Service**: Converts addresses to coordinates
- **Address Validation**: Validates addresses using Google Places API
- **Database Enhancement**: Stores coordinates and formatted addresses
- **Fallback Geocoding**: Uses OpenStreetMap when Google Maps is unavailable

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Places API**
   - **Geocoding API**
   - **Maps JavaScript API**
4. Create credentials (API Key)
5. Restrict the API key:
   - **Application restrictions**: HTTP referrers for frontend
   - **API restrictions**: Select the enabled APIs above

### 2. Configure Frontend

Add your API key to environment files:

**`.env.development`**
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**`.env.production`**
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Configure Backend

Add your API key to backend environment:

**Render Environment Variables:**
```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Local Development (.env):**
```
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 4. Install Dependencies

**Frontend:**
```bash
cd logistics-frontend/delivery-tracker
npm install @googlemaps/js-api-loader use-places-autocomplete
```

**Backend:**
```bash
cd logistics-backend
npm install node-fetch
```

## How It Works

### Without Google Maps API
- Uses OpenStreetMap Nominatim for basic suggestions
- Provides common Indian cities as quick suggestions
- Still functional but with limited accuracy

### With Google Maps API
- Real-time address suggestions from Google Places
- Accurate geocoding and address validation
- Better user experience with detailed address information

## Usage

1. **Customer Dashboard**: Users get address suggestions when typing pickup/drop addresses
2. **Address Storage**: Backend stores both original and formatted addresses with coordinates
3. **Map Integration**: Coordinates are used for accurate map display and routing

## API Costs

- **Places Autocomplete**: $0.00283 per request (first 100,000 requests free monthly)
- **Geocoding**: $0.005 per request (first 100,000 requests free monthly)
- **Maps JavaScript**: $0.007 per map load (first 100,000 loads free monthly)

## Fallback Behavior

If Google Maps API is not configured:
- Frontend uses SimpleAddressAutocomplete with OpenStreetMap
- Backend uses OpenStreetMap Nominatim for geocoding
- Application remains fully functional with reduced accuracy

## Testing

1. **Without API Key**: Application works with basic suggestions
2. **With API Key**: Enhanced suggestions and accurate geocoding
3. **Network Issues**: Graceful fallback to local suggestions

## Security Notes

- Never commit API keys to version control
- Use environment variables for all API keys
- Restrict API keys to specific domains/IPs
- Monitor API usage in Google Cloud Console
