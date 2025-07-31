import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

type Donor = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  bloodGroup: string;
  seen: boolean;
};

const charusatCoords: [number, number] = [22.6001, 72.8205]; // Charusat University coordinates

export function CharusatMap({ donors = [] }: { donors?: Donor[] }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-red-100">
      <MapContainer center={charusatCoords} zoom={16} style={{ height: '400px', width: '100%' }}>
        <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={charusatCoords as [number, number]}>
          <Popup>
            Charusat University
          </Popup>
        </Marker>
        {donors.filter(d => d.seen).map(donor => (
          <Marker key={donor.id} position={[donor.lat, donor.lng] as [number, number]}>
            <Popup>
              {donor.name} ({donor.bloodGroup})<br />
              SMS Seen
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}