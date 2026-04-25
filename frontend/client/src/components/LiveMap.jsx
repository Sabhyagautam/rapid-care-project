import { useEffect, useRef, useState } from 'react'

/**
 * LiveMap — shows driver location on an embedded OpenStreetMap.
 * No API key required. Updates the iframe src when driver moves.
 */
export default function LiveMap({ driverLocation, pickupLocation }) {
  const [mapUrl, setMapUrl] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  // Default center: India
  const defaultLat = pickupLocation?.latitude || 28.6139
  const defaultLng = pickupLocation?.longitude || 77.2090

  useEffect(() => {
    if (driverLocation?.latitude && driverLocation?.longitude) {
      const { latitude: lat, longitude: lng } = driverLocation
      // OpenStreetMap embed with marker
      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`
      setMapUrl(url)
      setLastUpdate(new Date().toLocaleTimeString())
    } else {
      // Show pickup location or default
      const lat = defaultLat
      const lng = defaultLng
      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02},${lat - 0.02},${lng + 0.02},${lat + 0.02}&layer=mapnik${pickupLocation?.latitude ? `&marker=${lat},${lng}` : ''}`
      setMapUrl(url)
    }
  }, [driverLocation, pickupLocation])

  return (
    <div className="w-full">
      {/* Map iframe */}
      <div className="relative w-full h-64 bg-slate-900 overflow-hidden">
        {mapUrl ? (
          <iframe
            key={mapUrl}
            src={mapUrl}
            title="Live Map"
            className="w-full h-full border-0"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-slate-500 text-sm">Loading map...</div>
          </div>
        )}

        {/* Overlay badge */}
        {driverLocation && (
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-green-500/40 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            Driver Live
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-3 bg-slate-900/50 flex items-center justify-between text-xs">
        {driverLocation ? (
          <>
            <span className="text-slate-400">
              {driverLocation.latitude.toFixed(5)}, {driverLocation.longitude.toFixed(5)}
            </span>
            <a
              href={`https://www.google.com/maps?q=${driverLocation.latitude},${driverLocation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-bold"
            >
              Open in Google Maps →
            </a>
          </>
        ) : (
          <span className="text-slate-500">Waiting for driver location...</span>
        )}
      </div>
    </div>
  )
}
