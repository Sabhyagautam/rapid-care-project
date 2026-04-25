import { useState, useEffect } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const socket = io('http://localhost:5001')

export default function DriverDashboard() {
  const [bookings, setBookings] = useState([])
  const [activeBooking, setActiveBooking] = useState(null)

  useEffect(() => {
    fetchBookings()

    socket.on('new-emergency', (data) => {
      setBookings(prev => [data, ...prev])
    })

    return () => socket.off('new-emergency')
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings')
      setBookings(response.data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const handleAccept = async (booking) => {
    try {
      await axios.patch(`/api/bookings/${booking._id}`, { status: 'assigned' })
      
      socket.emit('driver-accept', {
        booking_id: booking._id,
        driver_name: 'John Doe',
        phone: '+1234567890',
        ambulance_number: 'AMB-1234'
      })

      setActiveBooking(booking)
      fetchBookings()
    } catch (error) {
      alert('Error accepting booking')
    }
  }

  const handleReject = async (bookingId) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}`, { status: 'cancelled' })
      fetchBookings()
    } catch (error) {
      alert('Error rejecting booking')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-blue-600">🚗 Driver Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeBooking && (
          <div className="bg-green-100 border-2 border-green-500 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Active Booking</h2>
            <div className="bg-white rounded-lg p-4">
              <p className="font-bold text-lg">Patient: {activeBooking.patient_id?.name}</p>
              <p>📍 Pickup: {activeBooking.pickup_location}</p>
              <p>🏥 Destination: {activeBooking.hospital_destination}</p>
              <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
                Navigate to Patient
              </button>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-6">New Requests</h2>
        
        <div className="grid gap-6">
          {bookings.filter(b => b.status === 'pending').map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                      EMERGENCY
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                      {booking.emergency_type}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-3">
                    👤 {booking.patient_id?.name || 'Patient'}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600">📞 Phone</p>
                      <p className="font-bold">{booking.patient_id?.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">🩸 Blood Group</p>
                      <p className="font-bold">{booking.patient_id?.blood_group || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">📍 Pickup Location</p>
                      <p className="font-bold">{booking.pickup_location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">🏥 Destination</p>
                      <p className="font-bold">{booking.hospital_destination}</p>
                    </div>
                  </div>

                  {booking.patient_id?.medical_condition && (
                    <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-600">Medical Condition:</p>
                      <p className="font-bold">{booking.patient_id.medical_condition}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAccept(booking)}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition"
                    >
                      ✓ Accept Request
                    </button>
                    <button
                      onClick={() => handleReject(booking._id)}
                      className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {bookings.filter(b => b.status === 'pending').length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-gray-600">No new requests at the moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
