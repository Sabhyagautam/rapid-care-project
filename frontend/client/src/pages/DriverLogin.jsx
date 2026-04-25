import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DriverLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ driverName: '', phone: '', ambulanceNumber: '', ambulanceType: 'Basic' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.driverName.trim()) e.driverName = 'Name is required'
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit mobile number'
    if (!form.ambulanceNumber.trim()) e.ambulanceNumber = 'Ambulance number is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    setTimeout(() => {
      localStorage.setItem('driverInfo', JSON.stringify({ ...form, driverId: Date.now().toString() }))
      navigate('/driver/dashboard')
    }, 700)
  }

  const TYPES = [
    { value: 'Basic', label: 'Basic (BLS)', icon: '🚑' },
    { value: 'ICU', label: 'ICU (ALS)', icon: '🏥' },
    { value: 'Oxygen', label: 'Oxygen', icon: '💨' },
    { value: 'Accident', label: 'Trauma', icon: '⚡' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-red-950 via-red-900 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-red-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-orange-500 rounded-full blur-3xl"></div>
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
              </svg>
            </div>
            <span className="text-white font-black text-xl">RapidCare</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Drive.<br/>
            <span className="text-red-300">Save Lives.</span>
          </h1>
          <p className="text-red-200/70 text-lg leading-relaxed max-w-sm">
            Join our network of verified ambulance drivers. Accept emergency requests and help people when it matters most.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-4">
          {[
            { label: 'Avg Earnings/Day', val: '₹1,200+' },
            { label: 'Response Requests', val: 'Real-time' },
            { label: 'GPS Navigation', val: 'Built-in' },
            { label: 'Support', val: '24/7' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-white font-black text-lg">{s.val}</div>
              <div className="text-red-300/60 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
              </svg>
            </div>
            <span className="text-white font-black text-lg">Rapid<span className="text-red-500">Care</span></span>
          </div>

          <h2 className="text-3xl font-black text-white mb-2">Driver Sign In</h2>
          <p className="text-slate-500 text-sm mb-8">Enter your details to go online and accept rides</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Your full name"
                value={form.driverName}
                onChange={e => { setErrors(p => ({...p, driverName: ''})); setForm(p => ({...p, driverName: e.target.value})) }}
                className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition ${errors.driverName ? 'border-red-500/60' : 'border-white/10'}`}
              />
              {errors.driverName && <p className="text-red-400 text-xs mt-1.5">{errors.driverName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">+91</span>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  maxLength={10}
                  value={form.phone}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setErrors(p => ({...p, phone: ''}))
                    setForm(p => ({...p, phone: val}))
                  }}
                  className={`w-full pl-14 pr-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition ${errors.phone ? 'border-red-500/60' : 'border-white/10'}`}
                />
                {form.phone.length === 10 && /^[6-9]/.test(form.phone) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </div>
              {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
              {form.phone.length > 0 && form.phone.length < 10 && !errors.phone && (
                <p className="text-slate-500 text-xs mt-1.5">{10 - form.phone.length} more digits needed</p>
              )}
            </div>

            {/* Ambulance number */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Ambulance Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DL-01-AB-1234"
                value={form.ambulanceNumber}
                onChange={e => { setErrors(p => ({...p, ambulanceNumber: ''})); setForm(p => ({...p, ambulanceNumber: e.target.value.toUpperCase()})) }}
                className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition font-mono ${errors.ambulanceNumber ? 'border-red-500/60' : 'border-white/10'}`}
              />
              {errors.ambulanceNumber && <p className="text-red-400 text-xs mt-1.5">{errors.ambulanceNumber}</p>}
            </div>

            {/* Ambulance type */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Ambulance Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm(p => ({...p, ambulanceType: t.value}))}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${
                      form.ambulanceType === t.value
                        ? 'border-red-500 bg-red-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-sm font-bold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-xl font-black text-base transition shadow-xl shadow-red-900/30 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-5 h-5">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 8 16 12 12 16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              )}
              {loading ? 'Going Online...' : 'Go Online & Accept Rides'}
            </button>
          </form>

          <p className="text-center text-slate-600 text-xs mt-8">
            By continuing, you agree to our Driver Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}
