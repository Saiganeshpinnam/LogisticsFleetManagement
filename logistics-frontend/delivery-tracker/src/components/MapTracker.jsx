import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import socket from "../services/socket";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper component to move map view when position updates
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function MapTracker({ deliveryId, driverLocation, destination, pickup }) {
  // Use pickup coordinates as initial position if available, otherwise fallback to Hyderabad
  const getInitialPosition = () => {
    if (pickup && Array.isArray(pickup) && pickup.length === 2) {
      return pickup;
    }
    return [17.385, 78.4867]; // Default Hyderabad fallback
  };

  const [position, setPosition] = useState(getInitialPosition);
  const [route, setRoute] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [lastRoutePosition, setLastRoutePosition] = useState(null);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((pos1, pos2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (pos2[0] - pos1[0]) * Math.PI / 180;
    const dLon = (pos2[1] - pos1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1[0] * Math.PI / 180) * Math.cos(pos2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }, []);

  // Fetch route from current position to destination
  const fetchRoute = useCallback(async (start, end) => {
    if (!start || !end || start.length !== 2 || end.length !== 2) return;
    
    setIsLoadingRoute(true);
    setRouteError('');
    
    try {
      // Using OpenRouteService (free alternative to Google Directions)
      // You can also use OSRM (Open Source Routing Machine) which is completely free
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
      
      const response = await axios.get(osrmUrl, {
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const routeData = response.data.routes[0];
        const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert [lng, lat] to [lat, lng]
        
        setRoute(coordinates);
        setRouteInfo({
          distance: (routeData.distance / 1000).toFixed(2), // Convert to km
          duration: Math.round(routeData.duration / 60), // Convert to minutes
        });
      } else {
        // Fallback to straight line if no route found
        setRoute([start, end]);
        setRouteInfo(null);
      }
    } catch (error) {
      console.error('Route fetching error:', error);
      setRouteError('Unable to fetch route');
      // Fallback to straight line
      setRoute([start, end]);
      setRouteInfo(null);
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  useEffect(() => {
    const channel = `delivery-${deliveryId}`;
    const handleLocationUpdate = ({ lat, lng }) => {
      const newPosition = [lat, lng];
      setPosition(newPosition);
      
      // Only recalculate route if driver has moved significantly (more than 0.5 km)
      if (destination && Array.isArray(destination) && destination.length === 2) {
        if (!lastRoutePosition || calculateDistance(lastRoutePosition, newPosition) > 0.5) {
          fetchRoute(newPosition, destination);
          setLastRoutePosition(newPosition);
        }
      }
    };

    // Listen for driver location updates for this delivery
    socket.on(channel, handleLocationUpdate);
    socket.emit("subscribe-delivery", deliveryId);

    // Cleanup listener on unmount or deliveryId change
    return () => {
      socket.emit("unsubscribe-delivery", deliveryId);
      socket.off(channel, handleLocationUpdate);
    };
  }, [deliveryId, destination, lastRoutePosition, calculateDistance, fetchRoute]);

  // Initial route calculation when destination changes
  useEffect(() => {
    if (destination && Array.isArray(destination) && destination.length === 2) {
      // Use pickup as starting point if available, otherwise use current position
      const startPosition = (pickup && Array.isArray(pickup) && pickup.length === 2) ? pickup : position;
      fetchRoute(startPosition, destination);
    }
  }, [destination, pickup, position]);

  return (
    <div className="space-y-4">
      {/* Route Information */}
      {routeInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="text-blue-800">
                <span className="font-semibold">Distance:</span> {routeInfo.distance} km
              </div>
              <div className="text-blue-800">
                <span className="font-semibold">ETA:</span> {routeInfo.duration} minutes
              </div>
            </div>
            {isLoadingRoute && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Updating route...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {routeError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
          {routeError} - Showing direct path
        </div>
      )}

      {/* Map Container */}
      <div className="h-96 w-full rounded-xl shadow">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full rounded-xl"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> | Route by <a href="http://project-osrm.org/">OSRM</a>'
          />
          
          {/* Pickup Marker */}
          {pickup && Array.isArray(pickup) && pickup.length === 2 && (
            <Marker
              position={pickup}
              icon={L.divIcon({
                className: 'custom-pickup-marker',
                html: `<div style="background-color: #3B82F6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-blue-700">📦 Pickup Location</div>
                  <div className="text-sm text-gray-600">Delivery pickup point</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Driver Marker */}
          <Marker
            position={position}
            icon={L.divIcon({
              className: 'custom-driver-marker',
              html: `<div style="background-color: #10B981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-green-700">🚚 Driver Location</div>
                <div className="text-sm text-gray-600">Real-time tracking</div>
              </div>
            </Popup>
          </Marker>

          {/* Destination Marker */}
          {destination && Array.isArray(destination) && destination.length === 2 && (
            <Marker
              position={destination}
              icon={L.divIcon({
                className: 'custom-destination-marker',
                html: `<div style="background-color: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-red-700">📍 Drop Location</div>
                  <div className="text-sm text-gray-600">Delivery destination</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Polyline */}
          {route.length > 0 && (
            <Polyline 
              positions={route} 
              color="#3B82F6" 
              weight={4}
              opacity={0.8}
              dashArray={route.length === 2 ? "10, 10" : null} // Dashed line for straight path, solid for actual route
            />
          )}

          <RecenterMap position={position} />
        </MapContainer>
      </div>
    </div>
  );
}
