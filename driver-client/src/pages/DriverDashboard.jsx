import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'

const ACCEPT_TIMEOUT = 30

const EmergencyBadge = ({ type }) => {
  const colors = {
    ICU: 'bg-red-500/20 text-red-400 border-red-500/40',
    Basic: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    Oxygen: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    Accident: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  }
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${colors[type] || colors.Basic}`}>
      {type}
    </span>
  )
}

export default function DriverDashboard() {
  const navigate = useNavigate()
  const [driverInfo, setDriverInfo] = useState(null)
  const [rideRequests, setRideRequests] = useState([])
  const [activeRide, setActiveRide] = useState(null)
  const [isOnline, setIsOnline] = useState(false)
  const [totalRides, setTotalRides] = useState(0)
  const [earnings, setEarnings] = useState(0)
  const [avgRating, setAvgRating] = useState(null)
  const [ratings, setRatings] = useState([])
  const [waitingFeedback, setWaitingFeedback] = useState(null) // { rideId, patientName }
  const [timers, setTimers] = useState({})
  const socketRef = useRef(null)
  const locationWatchId = useRef(null)
  const timerIntervals = useRef({})

  useEffect(() => {
    const stored = localStorage.getItem('driverInfo')
    if (!stored) { navigate('/'); return }
    const info = JSON.parse(stored)
    setDriverInfo(info)

    const socket = io('http://localhost:4000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })
    socketRef.current = socket

    const register = () => {
      socket.emit('driverOnline', {
        driverId: info.driverId,
        driverName: info.driverName,
        phone: info.phone,
        ambulanceNumber: info.ambulanceNumber,
        location: { lat: 0, lng: 0 }
      })
      setIsOnline(true)
    }

    socket.on('connect', register)
    socket.on('reconnect', register)
    socket.on('connect_error', () => setIsOnline(false))
    socket.on('disconnect', () => setIsOnline(false))

    socket.on('newRideRequest', (ride) => {
      playBeep()
      setRideRequests(prev => prev.find(r => r.rideId === ride.rideId) ? prev : [ride, ...prev])
      startTimer(ride.rideId, info, socket)
    })

    socket.on('rideNoLongerAvailable', ({ rideId }) => removeRequest(rideId))
    socket.on('rideCancelled', ({ rideId }) => {
      removeRequest(rideId)
      if (activeRide?.rideId === rideId) setActiveRide(null)
    })

    socket.on('feedbackReceived', ({ rideId, rating }) => {
      setWaitingFeedback(null)
      if (rating) {
        setRatings(p => [...p, rating])
        setAvgRating(prev => {
          const all = prev ? [...Array(Math.round(parseFloat(prev))).fill(parseFloat(prev)), rating] : [rating]
          return (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1)
        })
      }
    })

    return () => {
      socket.disconnect()
      Object.values(timerIntervals.current).forEach(clearInterval)
      if (locationWatchId.current) navigator.geolocation.clearWatch(locationWatchId.current)
    }
  }, [navigate])

  const startTimer = (rideId, info, socket) => {
    setTimers(p => ({ ...p, [rideId]: ACCEPT_TIMEOUT }))
    timerIntervals.current[rideId] = setInterval(() => {
      setTimers(p => {
        const remaining = (p[rideId] || 0) - 1
        if (remaining <= 0) {
          clearInterval(timerIntervals.current[rideId])
          socket.emit('rejectRide', { driverId: info.driverId, rideId })
          setRideRequests(prev => prev.filter(r => r.rideId !== rideId))
          return { ...p, [rideId]: 0 }
        }
        return { ...p, [rideId]: remaining }
      })
    }, 1000)
  }

  const removeRequest = (rideId) => {
    clearInterval(timerIntervals.current[rideId])
    setTimers(p => { const n = { ...p }; delete n[rideId]; return n })
    setRideRequests(prev => prev.filter(r => r.rideId !== rideId))
  }

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = 880; osc.type = 'sine'
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.8)
    } catch (e) {}
  }

  const handleAccept = (ride) => {
    clearInterval(timerIntervals.current[ride.rideId])
    socketRef.current.emit('acceptRide', {
      driverId: driverInfo.driverId,
      rideId: ride.rideId,
      driverName: driverInfo.driverName,
      phone: driverInfo.phone,
      ambulanceNumber: driverInfo.ambulanceNumber
    })
    setActiveRide(ride)
    removeRequest(ride.rideId)
    startLocationTracking(ride.rideId)
  }

  const handleReject = (ride) => {
    clearInterval(timerIntervals.current[ride.rideId])
    socketRef.current.emit('rejectRide', { driverId: driverInfo.driverId, rideId: ride.rideId })
    removeRequest(ride.rideId)
  }

  const startLocationTracking = (rideId) => {
    if (!navigator.geolocation) return
    locationWatchId.current = navigator.geolocation.watchPosition(
      (pos) => socketRef.current.emit('driverLocation', { rideId, latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => console.error('GPS:', err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }

  const handleComplete = () => {
    socketRef.current.emit('rideCompleted', { rideId: activeRide.rideId, driverId: driverInfo.driverId })
    if (locationWatchId.current) navigator.geolocation.clearWatch(locationWatchId.current)
    setTotalRides(p => p + 1)
    setEarnings(p => p + (activeRide.fareEstimate || 350))
    setWaitingFeedback({ rideId: activeRide.rideId, patientName: activeRide.patientName })
    setActiveRide(null)
  }

  // Fetch driver ratings from completed bookings
  const fetchRatings = async (driverId) => {
    try {
      const res = await fetch(`http://localhost:4000/api/bookings?driverId=${driverId}`)
      const data = await res.json()
      const rated = data.filter(b => b.rating && b.driver_id === driverId)
      if (rated.length > 0) {
        const avg = rated.reduce((sum, b) => sum + b.rating, 0) / rated.length
        setAvgRating(avg.toFixed(1))
        setRatings(rated.map(b => b.rating))
      }
    } catch (e) {}
  }

  if (!driverInfo) return null

  // ── Waiting for patient feedback ──
  if (waitingFeedback) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
        {/* Header */}
        <div className="bg-[#111118] border-b border-white/5">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
                </svg>
              </div>
              <span className="font-black text-sm">Rapid<span className="text-red-400">Care</span> Driver</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black bg-green-500/10 text-green-400 border border-green-500/20">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              Online
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-[#111118] border border-white/5 rounded-2xl p-10 max-w-sm w-full text-center">

            {/* Animated waiting icon */}
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-3 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="w-7 h-7">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-black text-white mb-2">Waiting for Confirmation</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              The patient is reviewing the ride and submitting feedback. This usually takes a moment.
            </p>

            {/* Patient name */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
                {waitingFeedback.patientName?.[0]?.toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-500 mb-0.5">Patient</p>
                <p className="font-bold text-white text-sm">{waitingFeedback.patientName}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-yellow-400">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                Reviewing
              </div>
            </div>

            {/* Animated dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 bg-yellow-500/60 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>

            <p className="text-slate-600 text-xs">
              Your next ride requests will appear once confirmed
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* ── Top bar ── */}
      <div className="bg-[#111118] border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/40">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
              </svg>
            </div>
            <div>
              <div className="font-black text-sm leading-tight">Rapid<span className="text-red-400">Care</span></div>
              <div className="text-slate-500 text-xs">{driverInfo.driverName} · {driverInfo.ambulanceNumber}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online/Offline pill */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black border transition-all ${
              isOnline
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button
              onClick={() => { localStorage.removeItem('driverInfo'); socketRef.current?.disconnect(); navigate('/') }}
              className="text-slate-500 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Rides Today', value: totalRides, icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-blue-400">
                <rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2a2 2 0 0 1-2 2h-2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            )},
            { label: 'Earnings', value: `₹${earnings.toLocaleString()}`, icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-400">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            )},
            { label: 'Pending', value: rideRequests.length, icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-400">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
              </svg>
            )},
            { label: 'Avg Rating', value: avgRating ? `${avgRating} ★` : '—', icon: (
              <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" className="w-5 h-5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            )},
          ].map(s => (
            <div key={s.label} className="bg-[#111118] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                  {s.icon}
                </div>
              </div>
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-slate-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Active ride ── */}
        {activeRide && (
          <div className="bg-[#111118] border border-green-500/20 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-green-500/10 border-b border-green-500/20 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-black text-sm">Active Ride</span>
              </div>
              <EmergencyBadge type={activeRide.emergencyType} />
            </div>

            <div className="p-5">
              {/* Patient info */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-black">
                      {activeRide.patientName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-white">{activeRide.patientName}</p>
                      <p className="text-slate-400 text-xs">{activeRide.phone}</p>
                    </div>
                  </div>
                </div>
                {activeRide.fareEstimate && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Est. Fare</p>
                    <p className="text-green-400 font-black text-lg">₹{activeRide.fareEstimate}</p>
                  </div>
                )}
              </div>

              {/* Route */}
              <div className="bg-white/5 rounded-xl p-4 mb-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Pickup</p>
                    <p className="text-sm text-white font-semibold">{activeRide.pickupLocation}</p>
                  </div>
                </div>
                <div className="ml-1 w-px h-4 bg-slate-700"></div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Destination</p>
                    <p className="text-sm text-white font-semibold">{activeRide.dropLocation}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleComplete}
                  className="col-span-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-black text-sm transition flex items-center justify-center gap-1.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                  Done
                </button>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeRide.latitude},${activeRide.longitude}`, '_blank')}
                  className="col-span-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-black text-sm transition flex items-center justify-center gap-1.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                  Navigate
                </button>
                <a
                  href={`tel:${activeRide.phone}`}
                  className="col-span-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-black text-sm transition flex items-center justify-center gap-1.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17.5z"/></svg>
                  Call
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Incoming requests ── */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-black text-base text-white">
              {rideRequests.length > 0 ? 'Incoming Requests' : 'No Requests'}
            </h2>
            {rideRequests.length > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-black animate-pulse">
                {rideRequests.length}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {rideRequests.map(ride => {
              const remaining = timers[ride.rideId] || 0
              const pct = (remaining / ACCEPT_TIMEOUT) * 100
              const urgent = remaining <= 10
              return (
                <div key={ride.rideId} className={`bg-[#111118] border rounded-2xl overflow-hidden transition-all ${urgent ? 'border-red-500/40' : 'border-white/5'}`}>
                  {/* Timer strip */}
                  <div className="relative h-1 bg-white/5">
                    <div
                      className={`absolute left-0 top-0 h-full transition-all duration-1000 ${urgent ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${urgent ? 'bg-red-400 animate-ping' : 'bg-yellow-400 animate-pulse'}`}></div>
                        <span className={`text-xs font-black uppercase tracking-widest ${urgent ? 'text-red-400' : 'text-yellow-400'}`}>
                          New Request
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <EmergencyBadge type={ride.emergencyType} />
                        <span className={`text-xs font-black tabular-nums ${urgent ? 'text-red-400' : 'text-slate-400'}`}>
                          {remaining}s
                        </span>
                      </div>
                    </div>

                    {/* Patient */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-black text-base flex-shrink-0">
                        {ride.patientName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-white">{ride.patientName}</p>
                        <p className="text-slate-400 text-xs">{ride.phone}</p>
                      </div>
                      {ride.fareEstimate && (
                        <div className="ml-auto text-right">
                          <p className="text-xs text-slate-500">Fare</p>
                          <p className="text-green-400 font-black">₹{ride.fareEstimate}</p>
                        </div>
                      )}
                    </div>

                    {/* Route */}
                    <div className="bg-white/5 rounded-xl p-3 mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span className="text-slate-300 truncate">{ride.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-slate-300 truncate">{ride.dropLocation}</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAccept(ride)}
                        className="bg-green-600 hover:bg-green-700 py-3.5 rounded-xl font-black text-sm transition flex items-center justify-center gap-2"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(ride)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 py-3.5 rounded-xl font-black text-sm text-slate-400 hover:text-white transition flex items-center justify-center gap-2"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty state */}
          {rideRequests.length === 0 && !activeRide && (
            <div className="bg-[#111118] border border-white/5 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-slate-600">
                  <rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2a2 2 0 0 1-2 2h-2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </div>
              <p className="text-slate-400 font-bold mb-1">Waiting for requests</p>
              <p className="text-slate-600 text-sm">You'll be notified instantly when a patient needs help</p>
              <div className="flex items-center justify-center gap-1.5 mt-5">
                <div className="w-1.5 h-1.5 bg-slate-700 rounded-full animate-bounce" style={{animationDelay:'0s'}}></div>
                <div className="w-1.5 h-1.5 bg-slate-700 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                <div className="w-1.5 h-1.5 bg-slate-700 rounded-full animate-bounce" style={{animationDelay:'0.4s'}}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
