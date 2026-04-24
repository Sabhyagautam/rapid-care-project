import { useState } from 'react'
import LocationSearch from './LocationSearch'

/**
 * Example component showing how to use LocationSearch
 * This demonstrates all the features and data returned
 */
export default function LocationSearchExample() {
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleLocationSelect = (location) => {
    console.log('Location selected:', location)
    setSelectedLocation(location)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6">Location Search Demo</h2>

      {/* Location Search Component */}
      <LocationSearch
        placeholder="Type 'super' or any location..."
        label="Search Location"
        icon="🔍"
        onLocationSelect={handleLocationSelect}
      />

      {/* Display Selected Location Data */}
      {selectedLocation && (
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-2 border-green-500">
          <h3 className="text-xl font-bold text-green-600 mb-4">
            ✅ Location Selected!
          </h3>

          <div className="space-y-3">
            <div>
              <span className="font-bold text-gray-700">Location Name:</span>
              <p className="text-gray-900 mt-1">{selectedLocation.location_name}</p>
            </div>

            <div>
              <span className="font-bold text-gray-700">Full Address:</span>
              <p className="text-gray-900 mt-1">{selectedLocation.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-gray-700">Latitude:</span>
                <p className="text-gray-900 mt-1">{selectedLocation.latitude}</p>
              </div>
              <div>
                <span className="font-bold text-gray-700">Longitude:</span>
                <p className="text-gray-900 mt-1">{selectedLocation.longitude}</p>
              </div>
            </div>
          </div>

          {/* JSON Output */}
          <div className="mt-6 bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
              {JSON.stringify(selectedLocation, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h4 className="font-bold text-blue-900 mb-3">💡 How to Use:</h4>
        <ul className="space-y-2 text-blue-800">
          <li>• Type at least 3 characters to see suggestions</li>
          <li>• Use Arrow Up/Down to navigate suggestions</li>
          <li>• Press Enter to select highlighted suggestion</li>
          <li>• Press Escape to close dropdown</li>
          <li>• Click "Use Current" to get your GPS location</li>
          <li>• Click any suggestion to select it</li>
        </ul>
      </div>

      {/* Features List */}
      <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
        <h4 className="font-bold text-purple-900 mb-3">✨ Features:</h4>
        <div className="grid md:grid-cols-2 gap-3 text-purple-800">
          <div>✅ Real-time autocomplete</div>
          <div>✅ Google Places API</div>
          <div>✅ Keyboard navigation</div>
          <div>✅ Current location GPS</div>
          <div>✅ Rapido-style design</div>
          <div>✅ Lat/Long coordinates</div>
          <div>✅ Full address details</div>
          <div>✅ Mobile responsive</div>
        </div>
      </div>
    </div>
  )
}
