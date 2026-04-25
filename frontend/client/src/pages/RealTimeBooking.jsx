import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar'
import SimpleLocationInput from '../components/SimpleLocationInput'
import LiveMap from '../components/LiveMap'

// Fare config per type
const FARE = {
  Basic:    { base: 500,   perKm: 20 },
  Oxygen:   { base: 800,   perKm: 30 },
  ICU:      { base: 2000,  perKm: 60 },
  Accident: { base: 600,   perKm: 25 },
}

const TYPES = [
  { value: 'Basic',    label: 'Basic',    sub: 'BLS + Paramedic' },
  { value: 'Oxygen',   label: 'Oxygen',   sub: 'Respiratory support' },
  { value: 'ICU',      label: 'ICU',      sub: 'Advanced life support' },
  { value: 'Accident', label: 'Accident', sub: 'Trauma response' },
]

// Status pipeline
const STATUS_STEPS = ['pending', 'accepted', 'arriving', 'in-progress', 'completed']

function calcFare(type, distKm = 5) {
  const f = FARE[type] || FARE.Basic
  return Math.round(f.base + f.perKm * distKm)
}

function StatusBar({ status }) {
  const steps = ['Pending', 'Accepted', 'Arriving', 'In Progress', 'Completed']
  const idx = STATUS_STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-1 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className={`flex-1 h-1.5 rounded-full transition-all ${i <= idx ? 'bg-red-500' : 'bg-slate-700'}`}></div>
          {i === steps.length - 1 && null}
        </div>
      ))}
    </div>
  )
}

export default function RealTimeBooking() {
  const location = useLocation()
  const navigate = useNavigate()

  // step: form | searching | confirmed | cancelled
  const [step, setStep] = useState('form')
  const [rideStatus, setRideStatus] = useState('pending')
  const [driverInfo, setDriverInfo] = useState(null)
  const [driverLocation, setDriverLocation] = useState(null)
  const [currentRideId, setCurrentRideId] = useState(null)
  const [searchTime, setSearchTime] = useState(0)
  const [fareEstimate, setFareEstimate] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [completedData, setCompletedData] = useState(null)
  const [feedback, setFeedback] = useState({ rating: 0, confirmed: null, comment: '' })
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackDone, setFeedbackDone] = useState(false)

  const [pickup, setPickup] = useState(location.state?.pickup || null)
  const [destination, setDestination] = useState(location.state?.destination || null)

  const [form, setForm] = useState({
    name: '', phone: '', age: '', gender: 'Male',
    blood_group: '', medical_condition: '', emergency_type: 'Basic'
  })

  const socketRef = useRef(null)
  const timerRef = useRef(null)

  // Recalculate fare when type changes
  useEffect(() => {
    setFareEstimate(calcFare(form.emergency_type))
  }, [form.emergency_type])

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:4000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socketRef.current.on('rideAccepted', (data) => {
      clearInterval(timerRef.current)
      setDriverInfo(data)
      setRideStatus('accepted')
      setStep('confirmed')
    })

    socketRef.current.on('updateDriverLocation', (loc) => {
      setDriverLocation(loc)
      setRideStatus('arriving')
    })

    socketRef.current.on('rideCompletedNotification', (data) => {
      setRideStatus('completed')
      setCompletedData(data)
      setShowFeedback(true)
    })

    socketRef.current.on('rideRejected', () => {
      setStep('searching')
      setSearchTime(0)
    })

    socketRef.current.on('rideCancelled', () => {
      setStep('form')
      setCurrentRideId(null)
    })

    return () => {
      socketRef.current?.disconnect()
      clearInterval(timerRef.current)
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!pickup || !destination) return alert('Please enter both locations')

    try {
      const patientRes = await axios.post('/api/patients', {
        name: form.name, age: form.age, gender: form.gender,
        phone_number: form.phone, blood_group: form.blood_group,
        medical_condition: form.medical_condition,
        location: { lat: pickup.latitude || 0, lng: pickup.longitude || 0 }
      })

      socketRef.current.emit('patientOnline', { patientName: form.name, phone: form.phone })

      const bookingData = {
        patientId: patientRes.data._id,
        patientName: form.name,
        phone: form.phone,
        pickupLocation: pickup.address || pickup.location_name,
        dropLocation: destination.address || destination.location_name,
        latitude: pickup.latitude || 0,
        longitude: pickup.longitude || 0,
        emergencyType: form.emergency_type,
        fareEstimate,
        distanceKm: 5,
        requestTime: new Date().toISOString()
      }

      socketRef.current.emit('ambulanceRequest', bookingData)
      socketRef.current.once('bookingCreated', (data) => setCurrentRideId(data.rideId))

      setStep('searching')
      timerRef.current = setInterval(() => setSearchTime(t => t + 1), 1000)
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleCancel = async () => {
    if (!currentRideId) { setStep('form'); return }
    setCancelling(true)
    try {
      await axios.patch(`/api/bookings/${currentRideId}/cancel`, { reason: 'Cancelled by patient' })
      socketRef.current.emit('cancelRide', { rideId: currentRideId, reason: 'Cancelled by patient' })
      clearInterval(timerRef.current)
      setStep('form')
      setCurrentRideId(null)
      setSearchTime(0)
    } catch (err) {
      console.error('Cancel error:', err)
    } finally {
      setCancelling(false)
    }
  }

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  const handleFeedbackSubmit = async () => {
    if (!feedback.rating) return alert('Please give a star rating')
    if (feedback.confirmed === null) return alert('Please confirm if the ride was completed')
    setFeedbackSubmitting(true)
    try {
      await axios.patch(`/api/bookings/${currentRideId}/feedback`, {
        rating: feedback.rating,
        feedback_comment: feedback.comment,
        ride_confirmed_by_patient: feedback.confirmed
      })
      setFeedbackDone(true)
      setTimeout(() => navigate('/'), 2500)
    } catch (err) {
      console.error('Feedback error:', err)
      navigate('/')
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  // ── Feedback modal overlay ──
  if (showFeedback) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
          {feedbackDone ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" className="w-8 h-8">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-xl font-black text-white mb-2">Thank you!</h2>
              <p className="text-slate-400 text-sm">Your feedback helps improve the service.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" className="w-7 h-7">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="text-xl font-black text-white mb-1">Ride Completed</h2>
                <p className="text-slate-400 text-sm">
                  {completedData?.driverName ? `Driver: ${completedData.driverName}` : 'How was your experience?'}
                </p>
              </div>

              {/* Confirm ride */}
              <div className="mb-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                  Was the ride actually completed? <span className="text-red-400">*</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFeedback(p => ({ ...p, confirmed: true }))}
                    className={`py-3 rounded-xl font-bold text-sm border transition ${
                      feedback.confirmed === true
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-slate-600 text-slate-400 hover:border-green-500 hover:text-green-400'
                    }`}
                  >
                    Yes, completed
                  </button>
                  <button
                    onClick={() => setFeedback(p => ({ ...p, confirmed: false }))}
                    className={`py-3 rounded-xl font-bold text-sm border transition ${
                      feedback.confirmed === false
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'border-slate-600 text-slate-400 hover:border-red-500 hover:text-red-400'
                    }`}
                  >
                    No, it wasn't
                  </button>
                </div>
              </div>

              {/* Star rating */}
              <div className="mb-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                  Rate the driver <span className="text-red-400">*</span>
                </p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback(p => ({ ...p, rating: star }))}
                      className="transition-transform hover:scale-110"
                    >
                      <svg viewBox="0 0 24 24" className="w-10 h-10" fill={star <= feedback.rating ? '#f59e0b' : 'none'} stroke={star <= feedback.rating ? '#f59e0b' : '#475569'} strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  ))}
                </div>
                {feedback.rating > 0 && (
                  <p className="text-center text-xs text-slate-500 mt-2">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][feedback.rating]}
                  </p>
                )}
              </div>

              {/* Comment — optional */}
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Comment <span className="text-slate-600">(optional)</span>
                </p>
                <textarea
                  rows={3}
                  placeholder="Any feedback about the driver or service..."
                  value={feedback.comment}
                  onChange={e => setFeedback(p => ({ ...p, comment: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={feedbackSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-black text-sm transition"
                >
                  {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                <button
                  onClick={() => {
                    socketRef.current?.emit('feedbackSkipped', { rideId: currentRideId })
                    navigate('/')
                  }}
                  className="px-5 py-3.5 border border-slate-600 text-slate-400 hover:text-white rounded-xl font-bold text-sm transition"
                >
                  Skip
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Searching screen ──
  if (step === 'searching') {
    const mins = Math.floor(searchTime / 60)
    const secs = String(searchTime % 60).padStart(2, '0')
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 max-w-md w-full text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
              <div className="absolute inset-3 bg-red-500/30 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
              <div className="relative w-24 h-24 bg-red-600 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-11 h-11">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-black mb-2">Finding Nearest Ambulance</h2>
            <p className="text-slate-400 text-sm mb-6">Connecting you with the closest available driver</p>

            <div className="bg-slate-900 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                {pickup?.location_name || pickup?.address || 'Pickup location'}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                {destination?.location_name || destination?.address || 'Destination'}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                Estimated fare: <span className="font-bold text-white ml-1">₹{fareEstimate}</span>
              </div>
            </div>

            <p className="text-slate-500 text-sm mb-6">
              Searching {mins > 0 ? `${mins}m ` : ''}{secs}s...
            </p>

            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 py-3 rounded-xl font-bold transition text-sm"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Request'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Confirmed screen ──
  if (step === 'confirmed' && driverInfo) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="pt-20 pb-16 max-w-4xl mx-auto px-4">

          {/* Status bar */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-white">Ride Status</span>
              <span className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1 rounded-full capitalize">{rideStatus}</span>
            </div>
            <StatusBar status={rideStatus} />
            <div className="flex justify-between text-xs text-slate-500">
              {['Pending', 'Accepted', 'Arriving', 'In Progress', 'Done'].map(s => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Map */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
                <span className="font-bold text-sm">Live Tracking</span>
                {driverLocation && (
                  <div className="flex items-center gap-1.5 text-xs text-green-400">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    Live
                  </div>
                )}
              </div>
              <LiveMap driverLocation={driverLocation} pickupLocation={pickup} />
            </div>

            {/* Driver details */}
            <div className="space-y-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-black text-lg mb-4">Driver Details</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Driver', value: driverInfo.driverName },
                    { label: 'Phone', value: driverInfo.phone },
                    { label: 'Ambulance', value: driverInfo.ambulanceNumber },
                    { label: 'ETA', value: driverInfo.estimatedArrival, highlight: true },
                    { label: 'Fare Estimate', value: `₹${fareEstimate}`, highlight: true },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
                      <span className="text-slate-400 text-sm">{item.label}</span>
                      <span className={`font-bold text-sm ${item.highlight ? 'text-red-400' : 'text-white'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${driverInfo.phone}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-center text-sm transition"
                >
                  Call Driver
                </a>
                <button
                  onClick={handleCancel}
                  disabled={cancelling || rideStatus === 'arriving' || rideStatus === 'in-progress'}
                  className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Booking form ──
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="pt-20 pb-16 max-w-3xl mx-auto px-4">

        <div className="text-center mb-8 pt-6">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Emergency Booking
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Request an Ambulance</h1>
          <p className="text-slate-400 text-sm">Fill in the details below for immediate dispatch</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Patient info */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="font-black text-base mb-5 flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              </div>
              Patient Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Full Name <span className="text-red-400">*</span></label>
                <input type="text" required placeholder="Patient full name"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  value={form.name} onChange={f('name')} />
              </div>
              {/* Phone — digits only, max 10 */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Phone Number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">+91</span>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    maxLength={10}
                    value={form.phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setForm(p => ({ ...p, phone: val }))
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                  {form.phone.length === 10 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
                {form.phone.length > 0 && form.phone.length < 10 && (
                  <p className="text-slate-500 text-xs mt-1">{10 - form.phone.length} more digits needed</p>
                )}
              </div>
              {/* Age — 1 to 120 only */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Age <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 35"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={e => {
                    const val = e.target.value
                    if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 120)) {
                      setForm(p => ({ ...p, age: val }))
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>
              {/* Blood group */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Blood Group</label>
                <select
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-red-500 text-sm"
                  value={form.blood_group} onChange={f('blood_group')}
                >
                  <option value="">Select (optional)</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Gender</label>
                <select className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-red-500 text-sm"
                  value={form.gender} onChange={f('gender')}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Medical Condition</label>
                <input type="text" placeholder="e.g. Chest pain, fracture..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 text-sm"
                  value={form.medical_condition} onChange={f('medical_condition')} />
              </div>
            </div>
          </div>

          {/* Ambulance type */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="font-black text-base mb-5 flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              </div>
              Ambulance Type
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, emergency_type: t.value }))}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    form.emergency_type === t.value
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                  }`}
                >
                  <div className="font-black text-sm text-white">{t.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.sub}</div>
                  <div className="text-xs text-red-400 font-bold mt-2">₹{FARE[t.value].base}+</div>
                </button>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="font-black text-base mb-5 flex items-center gap-2">
              <div className="w-6 h-6 bg-red-600/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              </div>
              Locations
            </h2>
            <div className="space-y-4">
              <SimpleLocationInput
                placeholder="Your current location"
                label="Pickup Location"
                value={pickup?.location_name || ''}
                onLocationSelect={setPickup}
                dark
              />
              <SimpleLocationInput
                placeholder="Hospital or destination"
                label="Drop-off / Hospital"
                icon="🏥"
                value={destination?.location_name || ''}
                onLocationSelect={setDestination}
                dark
              />
            </div>
          </div>

          {/* Fare estimate */}
          {fareEstimate && (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide font-bold">Estimated Fare</p>
                <p className="text-white text-sm mt-0.5">Based on ~5 km distance · {form.emergency_type} ambulance</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-red-400">₹{fareEstimate}</p>
                <p className="text-slate-500 text-xs">Final fare may vary</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black text-lg transition shadow-lg shadow-red-900/40 flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
            </svg>
            Request Ambulance Now
          </button>
        </form>
      </div>
    </div>
  )
}
