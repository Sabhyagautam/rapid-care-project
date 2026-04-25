import { useState, useEffect, useRef } from 'react'

/**
 * Location input with:
 * - Live search suggestions via Nominatim (OpenStreetMap) — like Rapido
 * - GPS current location with reverse geocoding
 * - Works for both pickup and drop (any text allowed)
 * - dark prop for dark theme
 */
export default function SimpleLocationInput({
  placeholder = 'Enter location',
  onLocationSelect,
  label = 'Location',
  value = '',
  dark = false,
  showGPS = true,
}) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const searchPlaces = async (query) => {
    if (query.length < 3) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&countrycodes=in`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setSuggestions(data)
      setOpen(data.length > 0)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const val = e.target.value
    setInputValue(val)

    // Always pass typed text immediately so drop can be anything
    if (onLocationSelect) {
      onLocationSelect({ location_name: val, address: val, latitude: 0, longitude: 0 })
    }

    // Debounce search
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchPlaces(val), 350)
  }

  const handleSelect = (place) => {
    const name = place.display_name.split(',').slice(0, 3).join(', ')
    setInputValue(name)
    setOpen(false)
    setSuggestions([])
    if (onLocationSelect) {
      onLocationSelect({
        location_name: name,
        address: place.display_name,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
      })
    }
  }

  const handleGPS = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported')
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const name = data.display_name?.split(',').slice(0, 3).join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setInputValue(name)
          if (onLocationSelect) {
            onLocationSelect({ location_name: name, address: data.display_name || name, latitude, longitude })
          }
        } catch {
          const fallback = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setInputValue(fallback)
          if (onLocationSelect) onLocationSelect({ location_name: fallback, address: fallback, latitude, longitude })
        }
        setGpsLoading(false)
      },
      () => {
        setGpsLoading(false)
        alert('Unable to get location. Please enable GPS in browser settings.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const base = dark
    ? { wrap: 'bg-slate-900 border-slate-600 text-white placeholder-slate-500', label: 'text-slate-300', icon: 'text-slate-400', drop: 'bg-slate-800 border-slate-600', item: 'hover:bg-slate-700 text-white', sub: 'text-slate-400' }
    : { wrap: 'bg-white border-gray-200 text-gray-900 placeholder-gray-400', label: 'text-gray-700', icon: 'text-gray-400', drop: 'bg-white border-gray-200', item: 'hover:bg-red-50 text-gray-900', sub: 'text-gray-400' }

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${base.label}`}>
          {label}
        </label>
      )}

      <div className="relative">
        {/* Pin icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex-shrink-0 ${base.icon}`}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>

        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full pl-9 ${showGPS ? 'pr-24' : 'pr-3'} py-3 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition ${base.wrap}`}
        />

        {/* Loading spinner */}
        {loading && (
          <div className="absolute right-20 top-1/2 -translate-y-1/2">
            <svg className="animate-spin w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        )}

        {/* GPS button */}
        {showGPS && (
          <button
            type="button"
            onClick={handleGPS}
            disabled={gpsLoading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 ${
              gpsLoading ? 'opacity-50 cursor-not-allowed' : ''
            } ${dark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {gpsLoading ? (
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3 h-3">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
              </svg>
            )}
            GPS
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className={`absolute z-50 w-full mt-1 border rounded-xl shadow-xl overflow-hidden ${base.drop}`}>
          {suggestions.map((place, i) => {
            const parts = place.display_name.split(', ')
            const main = parts.slice(0, 2).join(', ')
            const sub = parts.slice(2, 5).join(', ')
            return (
              <button
                key={i}
                type="button"
                onMouseDown={() => handleSelect(place)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition border-b last:border-0 ${dark ? 'border-slate-700' : 'border-gray-100'} ${base.item}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{main}</p>
                  {sub && <p className={`text-xs truncate mt-0.5 ${base.sub}`}>{sub}</p>}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
