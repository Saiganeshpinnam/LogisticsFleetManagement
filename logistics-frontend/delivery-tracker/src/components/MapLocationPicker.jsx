import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from '../services/api';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Location marker component
const LocationMarker = ({ position, onLocationSelect, type }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng, type);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>
        <div className="text-center">
          <div className="font-semibold text-blue-700">
            {type === 'pickup' ? '📍 Pickup Location' : '📍 Drop Location'}
          </div>
          <div className="text-sm text-gray-600">Lat: {position.lat.toFixed(4)}</div>
          <div className="text-sm text-gray-600">Lng: {position.lng.toFixed(4)}</div>
        </div>
      </Popup>
    </Marker>
  ) : null;
};

const MapLocationPicker = ({ 
  onPickupSelect, 
  onDropSelect, 
  pickupLocation, 
  dropLocation,
  searchQuery 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('pickup');
  const [mapCenter, setMapCenter] = useState([17.385, 78.4867]); // Default Hyderabad
  const [zoom, setZoom] = useState(13);
  const mapRef = useRef(null);

  // Fetch location suggestions based on search query
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/locations/search?q=${encodeURIComponent(searchQuery)}&limit=10`
        );

        if (response.data && response.data.results) {
          setSuggestions(response.data.results);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle location selection from map click
  const handleLocationSelect = async (latlng, type) => {
    try {
      // Reverse geocode to get address
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );

      const address = response.data.address;
      const locationName = response.data.name || `${address.city || address.town}, ${address.country}`;

      if (type === 'pickup') {
        onPickupSelect({
          name: locationName,
          lat: latlng.lat,
          lng: latlng.lng,
          description: response.data.display_name,
        });
      } else {
        onDropSelect({
          name: locationName,
          lat: latlng.lat,
          lng: latlng.lng,
          description: response.data.display_name,
        });
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const location = {
      name: suggestion.main_text || suggestion.description,
      lat: suggestion.latitude,
      lng: suggestion.longitude,
      description: suggestion.description,
    };

    if (selectedType === 'pickup') {
      onPickupSelect(location);
    } else {
      onDropSelect(location);
    }

    // Center map on selected location
    setMapCenter([suggestion.latitude, suggestion.longitude]);
    setZoom(15);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen lg:h-96">
        {/* Left Panel - Search and Suggestions */}
        <div className="lg:col-span-1 p-4 overflow-y-auto border-r border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Location Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType('pickup')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                  selectedType === 'pickup'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📍 Pickup
              </button>
              <button
                onClick={() => setSelectedType('drop')}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                  selectedType === 'drop'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📍 Drop
              </button>
            </div>
          </div>

          {/* Selected Locations Display */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-semibold text-gray-600 mb-2">SELECTED LOCATIONS</div>
            {pickupLocation && (
              <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
                <div className="text-xs font-medium text-blue-700">📍 Pickup</div>
                <div className="text-xs text-gray-600 truncate">{pickupLocation.name}</div>
              </div>
            )}
            {dropLocation && (
              <div className="p-2 bg-red-50 rounded border border-red-200">
                <div className="text-xs font-medium text-red-700">📍 Drop</div>
                <div className="text-xs text-gray-600 truncate">{dropLocation.name}</div>
              </div>
            )}
          </div>

          {/* Suggestions List */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">LOCATION SUGGESTIONS</div>
            {isLoading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
            {suggestions.length === 0 && !isLoading && searchQuery && (
              <div className="text-xs text-gray-500 text-center py-4">No locations found</div>
            )}
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-2 rounded border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {suggestion.main_text || suggestion.description?.split(',')[0]}
                  </div>
                  <div className="text-xs text-gray-600">
                    {suggestion.secondary_text || suggestion.description?.split(',').slice(1).join(',')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs font-medium text-blue-700 mb-1">💡 How to use:</div>
            <div className="text-xs text-blue-600">
              1. Select Pickup or Drop<br/>
              2. Click on map or select from suggestions<br/>
              3. Location will be updated
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="lg:col-span-2 relative">
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            scrollWheelZoom={true}
            className="h-full w-full"
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Pickup Marker */}
            {pickupLocation && (
              <Marker
                position={[pickupLocation.lat, pickupLocation.lng]}
                icon={L.divIcon({
                  className: 'custom-pickup-marker',
                  html: `<div style="background-color: #3B82F6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">📍</div>`,
                  iconSize: [30, 30],
                  iconAnchor: [15, 15],
                })}
              >
                <Popup>
                  <div className="text-center">
                    <div className="font-semibold text-blue-700">📍 Pickup Location</div>
                    <div className="text-sm text-gray-600">{pickupLocation.name}</div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Drop Marker */}
            {dropLocation && (
              <Marker
                position={[dropLocation.lat, dropLocation.lng]}
                icon={L.divIcon({
                  className: 'custom-drop-marker',
                  html: `<div style="background-color: #EF4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">📍</div>`,
                  iconSize: [30, 30],
                  iconAnchor: [15, 15],
                })}
              >
                <Popup>
                  <div className="text-center">
                    <div className="font-semibold text-red-700">📍 Drop Location</div>
                    <div className="text-sm text-gray-600">{dropLocation.name}</div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Click to select location */}
            <LocationMarker
              position={null}
              onLocationSelect={handleLocationSelect}
              type={selectedType}
            />
          </MapContainer>

          {/* Map Instructions Overlay */}
          <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow text-xs text-gray-700 z-10">
            Click on map to select {selectedType === 'pickup' ? 'pickup' : 'drop'} location
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;
