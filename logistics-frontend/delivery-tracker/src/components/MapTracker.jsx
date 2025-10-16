import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import socket from "../services/socket";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

export default function MapTracker({ deliveryId, driverLocation, destination }) {
  const [position, setPosition] = useState([17.385, 78.4867]); // Default Hyderabad

  useEffect(() => {
    const channel = `delivery-${deliveryId}`;
    const handleLocationUpdate = ({ lat, lng }) => {
      setPosition([lat, lng]);
    };

    // Listen for driver location updates for this delivery
    socket.on(channel, handleLocationUpdate);
    socket.emit("subscribe-delivery", deliveryId);

    // Cleanup listener on unmount or deliveryId change
    return () => {
      socket.emit("unsubscribe-delivery", deliveryId);
      socket.off(channel, handleLocationUpdate);
    };
  }, [deliveryId]);

  return (
    <div className="h-96 w-full rounded-xl shadow">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full rounded-xl"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={position}>
          <Popup>Driver is here</Popup>
        </Marker>
        {destination && Array.isArray(destination) && destination.length === 2 && (
          <>
            <Marker position={destination}>
              <Popup>Drop</Popup>
            </Marker>
            <Polyline positions={[position, destination]} color="blue" />
          </>
        )}
        <RecenterMap position={position} />
      </MapContainer>
    </div>
  );
}
