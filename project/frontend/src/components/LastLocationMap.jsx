import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet';
import axios from 'axios';

const LastLocationMap = ({ requestId, bloodGroup }) => {
  const [location, setLocation] = useState(null);
  const [donor, setDonor] = useState(null);

  useEffect(() => {
    axios.get(`/responses/${requestId}/last/${bloodGroup}`)
      .then(res => {
        if (res.data.success && res.data.response && res.data.response.location) {
          setLocation(res.data.response.location); // { lat: ..., lng: ... }
          setDonor(res.data.response); // full donor response
        }
      })
      .catch(err => {
        console.error('Error fetching last location:', err);
      });
  }, [requestId, bloodGroup]);

  if (!location) return <div>No location found.</div>;

  return (
    <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[location.lat, location.lng]}>
        <Popup>
          Blood Group: {donor?.bloodGroup || 'Unknown'}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default LastLocationMap;