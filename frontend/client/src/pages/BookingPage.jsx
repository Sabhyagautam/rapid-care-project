import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar'
import SimpleLocationInput from '../components/SimpleLocationInput'

const socket = io('http://localhost:5001')

export default function BookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [driverInfo, setDriverInfo] = useState(null)
  const [pickupLocation, setPickupLocation] = useState(location.state?.pickup || null)
  const [destinationLocation, setDestinationLocation] = useState(location.state?.destination || null)

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone_number: '',
    gender: 'Male',
    blood_group: '',
    medical_condition: '',
    emergency_type: 'Basic',
    location: { lat: 0, lng: 0 }
  })

  useEffect(() => {
    getLocation()

    socket.on('booking-accepted', (data) => {
      setDriverInfo(data)
      setBookingConfirmed(true)
    })

    return () => socket.off('booking-accepted')
  }, [])

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }))
        },
        () => alert('Please enable location access')
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!pickupLocation || !destinationLocation) {
      alert('Please select both pickup and destination locations')
      return
    }
    
    try {
      const patientRes = await axios.post('/api/patients', {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        phone_number: formData.phone_number,
        blood_group: formData.blood_group,
        medical_condition: formData.medical_condition,
        location: {
          lat: pickupLocation.latitude,
          lng: pickupLocation.longitude
        }
      })

      const bookingRes = await axios.post('/api/bookings', {
        patient_id: patientRes.data._id,
        emergency_type: formData.emergency_type,
        pickup_location: pickupLocation.address,
        hospital_destination: destinationLocation.address,
        location: {
          lat: pickupLocation.latitude,
          lng: pickupLocation.longitude
        }
      })

      socket.emit('emergency-request', bookingRes.data)
      setStep(2)
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  if (bookingConfirmed && driverInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Ambulance Confirmed!</h2>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-xl mb-4">Driver Details</h3>
                <p className="text-lg mb-2">👨‍⚕️ {driverInfo.driver_name}</p>
                <p className="text-lg mb-2">📞 {driverInfo.phone}</p>
                <p className="text-lg mb-2">🚑 {driverInfo.ambulance_number}</p>
                <p className="text-lg font-bold text-red-600">⏱️ ETA: 8-12 minutes</p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-red-50">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="animate-pulse text-6xl mb-4">🚑</div>
              <h2 className="text-3xl font-bold mb-4">Finding Nearest Ambulance...</h2>
              <p className="text-gray-600 mb-6">Please wait while we assign a driver</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Emergency Ambulance</h1>
            <p className="text-gray-600">Fill in the details for quick response</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Blood Group
                </label>
                <input
                  type="text"
                  placeholder="e.g., O+, A-, B+"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  value={formData.blood_group}
                  onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Emergency Type *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  value={formData.emergency_type}
                  onChange={(e) => setFormData({...formData, emergency_type: e.target.value})}
                >
                  <option value="Basic">Basic Ambulance</option>
                  <option value="Oxygen">Oxygen Support</option>
                  <option value="ICU">ICU Ambulance</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Medical Condition
                </label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  value={formData.medical_condition}
                  onChange={(e) => setFormData({...formData, medical_condition: e.target.value})}
                  placeholder="Describe the medical condition..."
                />
              </div>

              <div className="md:col-span-2">
                <SimpleLocationInput
                  placeholder="Enter your current location"
                  label="Pickup Location"
                  icon="📍"
                  value={pickupLocation?.location_name || ''}
                  onLocationSelect={(location) => {
                    console.log('Pickup:', location)
                    setPickupLocation(location)
                  }}
                />
                {pickupLocation && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ {pickupLocation.location_name}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <SimpleLocationInput
                  placeholder="Enter hospital or destination"
                  label="Hospital Destination"
                  icon="🏥"
                  value={destinationLocation?.location_name || ''}
                  onLocationSelect={(location) => {
                    console.log('Destination:', location)
                    setDestinationLocation(location)
                  }}
                />
                {destinationLocation && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ {destinationLocation.location_name}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition transform hover:scale-105 shadow-lg"
            >
              🚨 Request Ambulance Now
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
