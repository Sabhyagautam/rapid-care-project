import { useState, useEffect } from 'react'
import axios from 'axios'

const STATUS_STYLE = {
  pending:      'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted:     'bg-blue-50 text-blue-700 border-blue-200',
  arriving:     'bg-purple-50 text-purple-700 border-purple-200',
  'in-progress':'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed:    'bg-green-50 text-green-700 border-green-200',
  cancelled:    'bg-red-50 text-red-700 border-red-200',
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('bookings')
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [b, d] = await Promise.all([
        axios.get('/api/bookings'),
        axios.get('/api/drivers'),
      ])
      setBookings(b.data)
      setDrivers(d.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const stats = [
    { label: 'Total Bookings', value: bookings.length },
    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
    { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
              </svg>
            </div>
            <span className="font-black text-gray-900">Rapid Care <span className="text-gray-400 font-normal text-sm">Admin</span></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              Live
            </div>
            <button onClick={fetchAll} className="text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="text-3xl font-black text-gray-900">{loading ? '—' : s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-gray-200 p-1 rounded-xl w-fit shadow-sm">
          {['bookings', 'drivers'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition ${
                tab === t ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Filter */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-2">
              {['all', 'pending', 'accepted', 'arriving', 'completed', 'cancelled'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-bold capitalize border transition ${
                    filter === f ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {f}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400">{filtered.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Patient', 'Phone', 'Type', 'Pickup', 'Destination', 'Fare', 'Status', 'Time'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(8)].map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-gray-400">
                        <p className="font-medium">No bookings found</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(b => (
                      <tr key={b._id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5 font-semibold text-gray-900">{b.patient_id?.name || '—'}</td>
                        <td className="px-5 py-3.5 text-gray-500">{b.patient_id?.phone_number || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full text-xs font-bold">{b.emergency_type}</span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 max-w-[140px] truncate">{b.pickup_location}</td>
                        <td className="px-5 py-3.5 text-gray-500 max-w-[140px] truncate">{b.hospital_destination}</td>
                        <td className="px-5 py-3.5 text-gray-700 font-semibold">{b.fare_estimate ? `₹${b.fare_estimate}` : '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLE[b.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(b.request_time).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'drivers' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <span className="font-bold text-gray-900">{drivers.length} Registered Drivers</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Phone', 'License', 'Ambulance No.', 'Status'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(5)].map((_, j) => (
                          <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse w-24"></div></td>
                        ))}
                      </tr>
                    ))
                  ) : drivers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-400 font-medium">No drivers registered</td>
                    </tr>
                  ) : (
                    drivers.map(d => (
                      <tr key={d._id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3.5 font-semibold text-gray-900">{d.name}</td>
                        <td className="px-5 py-3.5 text-gray-500">{d.phone}</td>
                        <td className="px-5 py-3.5 text-gray-500">{d.license_number || '—'}</td>
                        <td className="px-5 py-3.5 text-gray-500">{d.ambulance_number || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                            d.is_available
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}>
                            {d.is_available ? 'Available' : 'Busy'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
