import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import OsGridRef from 'geodesy/osgridref.js';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import 'leaflet-gesture-handling';

// Leaflet Icon Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// 1. CUSTOM HOOK (Defined outside the component)
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOnline;
}

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 14);
  return null;
}

// 2. COPY TO CLIPBOARD FEATURE
const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Attempt 1: Modern API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (err) {
        console.error('Clipboard API failed', err);
      }
    }

    // Attempt 2: Fallback for older browsers/stricter security
    try {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed"; // prevent scrolling to bottom
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10 transition-all active:scale-90 border border-white/20 ml-4"
      title="Copy to clipboard"
      type="button"
    >
      {copied ? (
        <span className="text-green-400 text-xs font-bold uppercase tracking-tighter">✓ Copied</span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
};

// 3. MAIN COMPONENT
export default function App() {
  const isOnline = useOnlineStatus(); // Hook call
  const [postcode, setPostcode] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

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
          const eVal = Number(result.eastings);
          const nVal = Number(result.northings);
          const GridConstructor = OsGridRef.default || OsGridRef;
          const gridRef = new GridConstructor(eVal, nVal);
          result.ngrFormatted = gridRef.toString();
          const latLon = gridRef.toLatLon();
          result.geoLat = latLon.lat.toFixed(6);
          result.geoLon = latLon.lon.toFixed(6);
        } catch (err) {
          console.log(err)
          result.ngrFormatted = "Calculation Error";
        }
        setData(result);
      } else {
        setError('Postcode not found');
        setData(null);
      }
    } catch (err) {
      console.log(err)
      if (!navigator.onLine) {
        setError('You are offline. Only previously searched postcodes will work.');
      } else {
        setError('Connection error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans 
    ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 text-white dark:bg-slate-800 transition-colors"
        >
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>
        <header className="mb-10 text-center relative">

                <h1 className={`text-4xl tracking-tight  transition-colors ${darkMode ? 'text-white' : 'text-slate-900'} `}>
                    Find a UK National Grid Reference
                  </h1>
                  <p className="text-slate-500 font-medium">
                    Converts postcodes to OSGB36 & WGS84
                  </p>
        </header>
        <main>
          <form onSubmit={lookupPostcode} className="w-full max-w-xl mb-10 relative">
            <h2 className="text-slate-500 font-bold text-lg mb-2 ml-1">
              <label htmlFor="postcode">Enter a postcode</label>
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                id="postcode"
                placeholder="e.g. PE12 6DE"
                /* Added dark:bg-slate-900, dark:text-white, and dark:focus:border-green-500 */
                className={`w-full min-w-0 flex-1 px-5 py-4 rounded-lg border-2 shadow-sm outline-none uppercase font-bold text-lg transition-all
          text-4xl tracking-tight  transition-colors ${darkMode ? 'border-slate-800 bg-slate-900 text-white focus:border-green-700' : 'bg-slate-100 border-white focus:border-yellow-400'} `}
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
              />
              <button
                type="submit"
                className={`w-full sm:w-auto  text-white font-bold px-8 py-4 rounded-lg shadow-lg transition-transform active:scale-95 whitespace-nowrap
               ${darkMode ? 'bg-emerald-950 hover:bg-emerald-900' : 'bg-green-800 hover:bg-green-700'}`}
              >
                {loading ? '...' : 'Search'}
              </button>
            </div>
          </form>

          {data && (
            <div className="grid grid-cols-12 w-full gap-8">
              {/* Primary NGR Card */}
              <div className= {`col-span-12 text-white p-8 rounded-[.5rem] shadow-2xl transition-colors ${darkMode ? 'bg-emerald-950' : 'bg-green-800'}`}>
                <h2 className="text-white text-[14px] font-bold tracking-[0.2em] mb-4 uppercase">National Grid Reference</h2>
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="text-4xl font-mono font-bold">{data.ngrFormatted}</h3>
                  <CopyButton textToCopy={data.ngrFormatted} />
                </div>

                <div className="grid grid-cols-12 gap-6 mt-8 pt-8 border-t border-white/10">
                  <div className="col-span-6 lg:col-span-3">
                    <p className="text-white text-[14px] font-bold block mb-1">Easting</p>
                    <div className="flex items-center">
                      <span className="text-[24px] font-mono font-bold">{data.eastings}</span>
                    </div>
                  </div>
                  <div className="col-span-6">
                    <p className="text-white text-[14px] font-bold block mb-1">Northing</p>
                    <div className="flex items-center">
                      <span className="text-[24px] font-mono font-bold">{data.northings}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Coordinates Card */}
              <div className={`col-span-12 space-y-6 p-8 rounded-[.5rem] shadow-sm border transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h4 className="text-slate-400 dark:text-slate-500 text-[14px] font-bold mb-3 tracking-widest uppercase">Calculated Decimal Coordinates</h4>
                <div className="grid grid-cols-12 gap-6 mt-1 pt-1">
                  <div className="col-span-6 lg:col-span-3">
                    <span className={`text-[14px] font-mono font-bold ${darkMode ? 'text-slate-200' : 'text-slate-500'}`}>Latitude</span>
                    <div className="flex items-center">
                      <span className={`text-[22px] font-mono font-bold ${darkMode ? 'text-slate-200' : 'text-slate-500'}`}>{data.geoLat}°</span>
                    </div>
                  </div>
                  <div className="col-span-6">
                    <span className={`block text-[14px] font-bold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-500'}`}>Longitude</span>
                    <div className="flex items-center">
                      <span className={`text-[22px] font-mono font-bold ${darkMode ? 'text-slate-200' : 'text-slate-500'}`}>{data.geoLon}°</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Section with Lighter Dark Tiles */}
              <div className={`col-span-12 min-h-[500px] p-3 rounded-[.5rem] shadow-xl border overflow-hidden relative z-0 transition-colors
        ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <MapContainer
                  center={[data.latitude, data.longitude]}
                  zoom={15}
                  className="h-full w-full rounded-[.5rem]"
                  gestureHandling={true}
                >
                  {/* Using CartoDB Voyager (lighter than Dark Matter) */}
                  <TileLayer 
                    url={darkMode 
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    } 
                    attribution={darkMode 
                      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' 
                      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }
                  />
                  <Marker position={[data.latitude, data.longitude]} />
                  <ChangeView center={[data.latitude, data.longitude]} />
                </MapContainer>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}