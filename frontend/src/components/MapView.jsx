import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon paths for Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Configure default icon
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map view updates
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], zoom || 12, {
        duration: 1,
        animate: true
      });
    }
  }, [center, map, zoom]);
  
  return null;
};

export default function MapView({ points = [], centerView, zoom = 12 }) {
  const mapRef = useRef();
  
  // Filter out points without coordinates and sort by date (newest first)
  const validPoints = useMemo(() => 
    points
      .filter(p => p.coords?.lat && p.coords?.lng)
      .sort((a, b) => new Date(b.createdAt || b.uploadDate || 0) - new Date(a.createdAt || a.uploadDate || 0)),
    [points]
  );

  // Use the most recent point as center if no centerView is provided
  const center = centerView || validPoints[0]?.coords || { lat: 9.0765, lng: 7.3986 }; // Default: Abuja, NG

  // Memoize markers to prevent unnecessary re-renders
  const markers = useMemo(() => 
    validPoints.map((p, i) => (
      <Marker key={p._id || i} position={[p.coords.lat, p.coords.lng]}>
        <Popup>
          <div className="text-sm">
            <div className="font-medium">{p.caption || 'Upload'}</div>
            <div>{new Date(p.createdAt || p.uploadDate || new Date()).toLocaleString()}</div>
            {p.location && (
              <div className="mt-1 text-xs text-gray-500">
                {p.location.coordinates?.join(', ')}
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    )),
    [validPoints]
  );

  return (
    <div className="w-full h-96 rounded overflow-hidden border">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        whenCreated={mapInstance => { mapRef.current = mapInstance; }}
        zoomControl={true}
        doubleClickZoom={true}
        closePopupOnClick={true}
        dragging={true}
        easeLinearity={0.35}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ChangeView center={center} zoom={zoom} />
        {markers}
      </MapContainer>
    </div>
  );
}