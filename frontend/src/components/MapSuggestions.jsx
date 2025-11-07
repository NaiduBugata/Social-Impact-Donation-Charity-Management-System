import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import HelperCard from './HelperCard';

// Fix default marker icon issue in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapSuggestions({ requestId }) {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/geo/match', { method: 'POST', body: JSON.stringify({ requestId, radiusKm: 10 }), headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (data.success) setMatches(data.data);
      else setMatches({ helpers: [], donors: [] });
    } catch (err) {
      console.error(err);
      setMatches({ helpers: [], donors: [] });
    } finally { setLoading(false); }
  };

  const defaultCenter = [28.7041, 77.1025]; // Delhi coords as default

  return (
    <div style={{padding:12, border:'1px dashed #e5e7eb', borderRadius:8}}>
      <h3>Nearby Matches</h3>
      <p style={{color:'#6b7280'}}>Find helpers and donors near this request (mock)</p>
      <div style={{display:'flex', gap:8, marginBottom:12}}>
        <button onClick={fetchMatches}>Find Nearby</button>
        <button onClick={()=>setShowMap(!showMap)}>{showMap ? 'Hide Map' : 'Show Map'}</button>
      </div>

      {showMap && matches && (
        <div style={{height:300, marginBottom:12, border:'1px solid #e5e7eb', borderRadius:8, overflow:'hidden'}}>
          <MapContainer center={defaultCenter} zoom={13} style={{height:'100%', width:'100%'}}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {matches.helpers.map(h => h.location && (
              <Marker key={h.id} position={[h.location.lat, h.location.lng]}>
                <Popup>{h.name} (Helper - {h.profession})</Popup>
              </Marker>
            ))}
            {matches.donors.map(d => d.location && (
              <Marker key={d.id} position={[d.location.lat, d.location.lng]}>
                <Popup>{d.name || d.username} (Donor)</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {loading && <div>Loading...</div>}
      {matches && (
        <div>
          <h4>Helpers</h4>
          {matches.helpers.length === 0 && <div style={{color:'#6b7280'}}>No helpers found nearby</div>}
          {matches.helpers.map(h => <HelperCard key={h.id} helper={h} onAccept={(helper)=> alert('Mock: request sent to '+helper.name)} />)}

          <h4>Donors</h4>
          {matches.donors.length === 0 && <div style={{color:'#6b7280'}}>No donors found nearby</div>}
          {matches.donors.map(d => (
            <div key={d.id} style={{border:'1px solid #eee', padding:8, borderRadius:6, marginBottom:6}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div>{d.name || d.username} <small style={{color:'#6b7280'}}>(Donor)</small></div>
                <div><button onClick={()=>alert('Mock: notify donor '+(d.name||d.username))}>Notify</button></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
