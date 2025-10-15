import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

export default function MapTracker({ deliveryId, driverLocation }) {
  const [position, setPosition] = useState([17.385, 78.4867]); // Default Hyderabad

  useEffect(() => {
    const handleLocationUpdate = (data) => {
      if (data.deliveryId === deliveryId) {
        setPosition([data.lat, data.lng]);
      }
    };

    // Listen for driver location updates from backend
    socket.on("driver-location", handleLocationUpdate);

    // Cleanup listener on unmount or deliveryId change
    return () => {
      socket.off("driver-location", handleLocationUpdate);
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
        <RecenterMap position={position} />
      </MapContainer>
    </div>
  );
}
