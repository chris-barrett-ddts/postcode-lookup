import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import OsGridRef from 'geodesy/osgridref.js'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import 'leaflet-gesture-handling';

// Leaflet Icon Fix for Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 14);
  return null;
}

export default function App() {
  const [postcode, setPostcode] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookupPostcode = async (e) => {
    e.preventDefault();
    if (!postcode) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`https://api.postcodes.io/postcodes/${postcode.replace(/\s+/g, '')}`);
      const json = await response.json();

      if (json.status === 200) {
        const result = json.result;

        try {
          // 1. Convert to Numbers
          const eVal = Number(result.eastings);
          const nVal = Number(result.northings);

          // 2. Initialize Geodesy OsGridRef
          const GridConstructor = OsGridRef.default || OsGridRef;
          const gridRef = new GridConstructor(eVal, nVal);
          
          // 3. Get Alphanumeric NGR (Default is 10 chars, e.g., TQ 30047 80339)
          result.ngrFormatted = gridRef.toString(); 

          // 4. Get Decimal Lat/Lon from the Grid Ref (OSGB36 to WGS84 transformation)
          const latLon = gridRef.toLatLon(); 
          result.geoLat = latLon.lat.toFixed(6);
          result.geoLon = latLon.lon.toFixed(6);
        } catch (err) {
          console.error("Geodesy Error:", err);
          result.ngrFormatted = "Calculation Error";
        }

        setData(result);
      } else {
        setError('Postcode not found');
        setData(null);
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tight text-black-950">Find a UK National Grid Reference</h1>
          <p className="text-slate-500 font-medium">Converts postcodes to OSGB36 & WGS84</p>
        </header>

        <form onSubmit={lookupPostcode} className="w-full max-w-xl mb-10 ">
  <p className="text-slate-500 font-bold text-lg mb-2 ml-1">
    <label htmlFor="postcode">Enter a postcode</label>
  </p>
  

  <div className="flex flex-col sm:flex-row gap-3">
    <input 
      type="text"
      id="postcode"
      placeholder="e.g. SW1A 1AA"
      /* Added min-w-0 and w-full to prevent the input from forcing its own width */
      className="w-full min-w-0 flex-1 px-5 py-4 rounded-lg border-2 border-white shadow-sm focus:border-yellow-500 outline-none uppercase font-bold text-lg transition-all"
      value={postcode}
      onChange={(e) => setPostcode(e.target.value)}
    />
    <button 
      type="submit"
      className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-bold px-8 py-4 rounded-lg shadow-lg transition-transform active:scale-95 whitespace-nowrap"
    >
      {loading ? '...' : 'Search'}
    </button>
  </div>
</form>

        {error && <div className="text-center text-red-500 font-bold mb-8">{error}</div>}

        {data && (
<div className="grid grid-cols-12 w-full gap-8">
  
  {/* Row 1: NGR Display */}
  <div className="col-span-12 bg-green-800 text-white p-8 rounded-[.5rem] shadow-2xl">
    <h2 className="text-black-400 text-[14px] font-bold  tracking-[0.2em] mb-4">National Grid Reference</h2>
    <h3 className="text-4xl font-mono font-bold">{data.ngrFormatted}</h3>
    
    <div className="grid grid-cols-12 gap-6 mt-8 pt-8 border-t border-black-900">
      <div className="col-span-6 lg:col-span-3">
        <p className="text-black-400 text-[14px] font-bold block mb-1">Easting</p>
        <span className="text-2xl font-mono font-medium">{data.eastings}</span>
      </div>
      <div className="col-span-6 "> 
        <p className="text-black-400 text-[14px]  font-bold block mb-1">Northing</p>
        <span className="text-2xl font-mono font-medium">{data.northings}</span>
      </div>
    </div>
  </div>

  {/* Row 2: Geo Comparison  */}
  <div className="col-span-12 space-y-6 bg-white p-8 rounded-[.5rem] shadow-sm border border-slate-200">
      <h4 className="text-slate-400 text-[14px]  font-bold mb-3 tracking-widest">Calculated Decimal Coordinates</h4>
      <div className="grid grid-cols-12 gap-6 mt-1 pt-1">
        <div className="col-span-6 lg:col-span-3"> 
          <span className="block text-[14px] text-slate-400 font-bold mb-1">Latitude</span>
          <span className="text-xl font-mono font-bold text-black-600">{data.geoLat}°</span>
        </div>
        <div className="col-span-6"> 
          <span className="block text-[14px] text-slate-400 font-bold mb-1">Longitude</span>
          <span className="text-xl font-mono font-bold text-black-600">{data.geoLon}°</span>
        </div>
      </div>
  </div>

  {/* Row 3: Map */}
  <div className="col-span-12 min-h-[500px] bg-white p-3 rounded-[.5rem] shadow-xl border border-slate-200 overflow-hidden relative z-0">
    <MapContainer 
      center={[data.latitude, data.longitude]} 
      zoom={15} 
      className="h-full w-full rounded-[.5rem]"
      gestureHandling={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[data.latitude, data.longitude]} />
      <ChangeView center={[data.latitude, data.longitude]} />
    </MapContainer>
  </div>

</div>
        )}
      </div>
    </div>
  );
}