import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import OsGridRef from 'geodesy/osgridref.js'; 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

        <form onSubmit={lookupPostcode} className="flex flex-col gap-3 max-w-xl mx-auto mb-12">
          <p className="text-slate-500 font-medium flex-1  font-bold text-lg "><label for="postcode">Enter a postcode</label></p>
          <div className="flex sm:flex-row gap-3 max-w-xl mb-12">
          <input 
            type="text"
            id="postcode"
            placeholder=""
            className="flex-1 px-6 py-4 rounded-2xl border-2 border-white shadow-sm focus:border-black-500 outline-none uppercase font-bold text-lg transition-all"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-green-700 hover:bg-green-800 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-black-200 transition-transform active:scale-95"
          >
            {loading ? '...' : 'Search'}
          </button>
          </div>
        </form>

        {error && <div className="text-center text-red-500 font-bold mb-8">{error}</div>}

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Data */}
            <div className="lg:col-span-12 space-y-6">
              
              {/* NGR Display */}
              <div className="lg:col-span-7  bg-green-800 text-white p-8 rounded-[.5rem] shadow-2xl">
                <h2 className="text-black-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">National Grid Reference</h2>
                <h3 className="text-4xl font-mono font-bold">{data.ngrFormatted}</h3>
                
                <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-black-900">
                  <div>
                    <p className="text-black-400 text-[14px] uppercase font-bold block mb-1">Easting</p>
                    <span className="text-2xl font-mono font-medium">{data.eastings}</span>
                  </div>
                  <div>
                    <p className="text-black-400 text-[14px] uppercase font-bold block mb-1">Northing</p>
                    <span className="text-2xl font-mono font-medium">{data.northings}</span>
                  </div>
                </div>
              </div>

              {/* Geo Comparison */}
              <div className=" lg:col-span-6 bg-white p-8 rounded-[.5rem] shadow-sm border border-slate-200">
                <h4 className="text-slate-400 text-[14px] uppercase font-bold mb-6 tracking-widest text-center">Calculated Decimal Coordinates</h4>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <span className="block text-[14px] text-slate-400 font-bold mb-1">Lattitude</span>
                    <span className="text-xl font-mono font-bold text-black-600">{data.geoLat}°</span>
                  </div>
                  <div className="w-px h-10 bg-slate-100"></div>
                  <div className="text-center">
                    <span className="block text-[14px] text-slate-400 font-bold mb-1">Longitude</span>
                    <span className="text-xl font-mono font-bold text-black-600">{data.geoLon}°</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Map */}
            <div className="lg:col-span-12 min-h-[500px] bg-white p-3 rounded-[.5rem] shadow-xl border border-slate-200 overflow-hidden relative z-0">
              <MapContainer 
                center={[data.latitude, data.longitude]} 
                zoom={15} 
                className="h-full w-full rounded-[.5rem]"
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