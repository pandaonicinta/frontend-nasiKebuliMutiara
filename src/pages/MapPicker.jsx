import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({

    click(e) {
      const coords = e.latlng;
      setPosition(coords);
      onLocationSelect(coords); // Pass to parent
    },
  });

  return position ? <Marker position={position} /> : null;
};

const MapPicker = ({ onSelect }) => {
  const handleLocationSelect = (coords) => {
    onSelect({
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

  return (
    <MapContainer center={[-6.340524556872198, 107.11309999756057]} zoom={13} style={{ height: '50vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker onLocationSelect={handleLocationSelect} />
    </MapContainer>
  );
};

export default MapPicker;
