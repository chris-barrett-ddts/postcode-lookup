# UK National Grid Reference Finder (PWA)

A fast, mobile-first Progressive Web App (PWA) that converts UK postcodes into National Grid References (OSGB36) and Decimal Coordinates (WGS84). 

**Live Demo:** [https://chris-barrett-ddts.github.io/postcode-lookup/](https://chris-barrett-ddts.github.io/postcode-lookup/)

## 🚀 Features

- **Instant Lookup:** Convert any UK postcode to Eastings, Northings, and NGR.
- **Interactive Map:** Visualizes the location using Leaflet and OpenStreetMap.
- **PWA Ready:** Install it on your phone or desktop for a native app experience.
- **Offline Mode:** Uses Workbox caching to allow lookups of previously searched postcodes without an internet connection.
- **Precision:** Uses the `geodesy` library for accurate coordinate transformation.

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/) (via Vite)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Mapping:** [React-Leaflet](https://react-leaflet.js.org/)
- **PWA Engine:** [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- **API:** [Postcodes.io](https://postcodes.io/)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/chris-barrett-ddts/postcode-lookup.git](https://github.com/chris-barrett-ddts/postcode-lookup.git)

2. **Install dependencies:**
     ```bash
      npm install

3. **Run in development mode:**
     ```bash
      npm run dev

4. **Build for production:**
      ```bash
      npm run build


## 📱 PWA & Offline Support

This app is configured with a Service Worker that caches API responses and map tiles. To test offline functionality:

Search for a postcode while online.

Turn off your internet (or use DevTools "Offline" mode).

Search for the same postcode again; the data will load instantly from the cache.

## 📄 License
MIT