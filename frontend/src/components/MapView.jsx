import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon paths for Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow })
L.Marker.prototype.options.icon = DefaultIcon

export default function MapView({ points = [] }) {
  const center = points[0]?.coords || { lat: 9.0765, lng: 7.3986 } // Default: Abuja, NG

  return (
    <div className="w-full h-96 rounded overflow-hidden border">
      <MapContainer center={[center.lat, center.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {points.map((p, i) => (
          p.coords?.lat && p.coords?.lng ? (
            <Marker key={p._id || i} position={[p.coords.lat, p.coords.lng]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-medium">{p.caption || 'Upload'}</div>
                  <div>{new Date(p.createdAt).toLocaleString()}</div>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  )
}