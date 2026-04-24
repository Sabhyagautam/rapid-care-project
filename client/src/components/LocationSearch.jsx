import { useState, useEffect, useRef } from 'react'
import { useLoadScript } from '@react-google-maps/api'

const libraries = ['places']

export default function LocationSearch({ 
  placeholder = "Enter location", 
  onLocationSelect,
  icon = "📍",
  label = "Location"
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const autocompleteService = useRef(null)
  const placesService = useRef(null)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  })

  // Debug: Log API key status
  useEffect(() => {
    console.log('Google Maps API Key exists:', !!apiKey)
    console.log('Google Maps loaded:', isLoaded)
    if (loadError) {
      console.error('Google Maps load error:', loadError)
    }
  }, [apiKey, isLoaded, loadError])

  useEffect(() => {
    if (isLoaded && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      )
    }
  }, [isLoaded])

  useEffect(() => {
    if (query.length > 2 && autocompleteService.current) {
      const request = {
        input: query,
        componentRestrictions: { country: 'in' }, // Change country code as needed
      }

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        console.log('Autocomplete status:', status)
        console.log('Predictions:', predictions)
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions)
          setShowDropdown(true)
        } else {
          console.warn('No predictions or error:', status)
          setSuggestions([])
        }
      })
    } else {
      setSuggestions([])
      setShowDropdown(false)
    }
  }, [query])

  const handleSelectLocation = (suggestion) => {
    if (!placesService.current) return

    const request = {
      placeId: suggestion.place_id,
      fields: ['name', 'formatted_address', 'geometry'],
    }

    placesService.current.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const locationData = {
          location_name: place.name,
          address: place.formatted_address,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        }

        setQuery(place.name)
        setShowDropdown(false)
        setSuggestions([])
        
        if (onLocationSelect) {
          onLocationSelect(locationData)
        }
      }
    })
  }

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelectLocation(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          
          // Reverse geocoding to get address
          const geocoder = new window.google.maps.Geocoder()
          const latlng = { lat: latitude, lng: longitude }
          
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const locationData = {
                location_name: 'Current Location',
                address: results[0].formatted_address,
                latitude,
                longitude,
              }
              
              setQuery('Current Location')
              if (onLocationSelect) {
                onLocationSelect(locationData)
              }
            }
          })
        },
        (error) => {
          alert('Unable to get your location. Please enable location access.')
        }
      )
    }
  }

  if (loadError) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 font-medium">⚠️ Google Maps API Error</p>
          <p className="text-red-600 text-sm mt-1">
            {loadError.message || 'Failed to load Google Maps'}
          </p>
          <p className="text-red-600 text-sm mt-2">
            Please check your API key in client/.env file
          </p>
        </div>
        {/* Fallback to simple input */}
        <input
          type="text"
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          onChange={(e) => onLocationSelect && onLocationSelect({
            location_name: e.target.value,
            address: e.target.value,
            latitude: 0,
            longitude: 0
          })}
        />
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {icon} {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
          📍
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400"
        />

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Use Current
        </button>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSelectLocation(suggestion)}
              className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-red-50 border-l-4 border-l-red-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl mt-1">📍</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
