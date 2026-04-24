import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', phone: '', age: '', gender: 'Male', blood_group: '', password: ''
  })

  const f = (key) => (e) => {
    setError('')
    setForm(p => ({ ...p, [key]: e.target.value }))
  }

  const validate = () => {
    if (mode === 'register') {
      if (!form.name.trim()) return 'Full name is required'
      if (!/^[6-9]\d{9}$/.test(form.phone)) return 'Enter a valid 10-digit Indian mobile number'
      const age = parseInt(form.age)
      if (!form.age || isNaN(age) || age < 1 || age > 120) return 'Enter a valid age (1–120)'
      if (form.password.length < 6) return 'Password must be at least 6 characters'
    } else {
      if (!/^[6-9]\d{9}$/.test(form.phone)) return 'Enter a valid 10-digit mobile number'
      if (!form.password) return 'Password is required'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')

    try {
      if (mode === 'register') {
        const res = await axios.post('/api/patients', {
          name: form.name,
          phone_number: form.phone,
          age: parseInt(form.age),
          gender: form.gender,
          blood_group: form.blood_group,
          medical_condition: '',
          location: { lat: 0, lng: 0 }
        })
        localStorage.setItem('userInfo', JSON.stringify({
          id: res.data._id,
          name: form.name,
          phone: form.phone,
        }))
      } else {
        // Simple phone-based login — check if patient exists
        const res = await axios.get(`/api/patients?phone=${form.phone}`)
        const patients = res.data
        if (!patients || patients.length === 0) {
          setError('No account found with this number. Please register.')
          setLoading(false)
          return
        }
        const user = patients[0]
        localStorage.setItem('userInfo', JSON.stringify({
          id: user._id,
          name: user.name,
          phone: user.phone_number,
        }))
      }
      navigate('/book')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
            </svg>
          </div>
          <span className="font-black text-gray-900">Rapid<span className="text-red-600">Care</span></span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

            {/* Tab switcher */}
            <div className="flex border-b border-gray-100">
              {['login', 'register'].map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError('') }}
                  className={`flex-1 py-4 text-sm font-black capitalize transition ${
                    mode === m
                      ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div className="p-8">
              <h1 className="text-2xl font-black text-gray-900 mb-1">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-gray-500 text-sm mb-7">
                {mode === 'login'
                  ? 'Sign in to book an ambulance quickly'
                  : 'Register once, book faster every time'}
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={form.name}
                      onChange={f('name')}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setError('')
                        setForm(p => ({ ...p, phone: val }))
                      }}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  {form.phone.length > 0 && form.phone.length < 10 && (
                    <p className="text-xs text-orange-500 mt-1">{10 - form.phone.length} more digits needed</p>
                  )}
                </div>

                {mode === 'register' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 28"
                        min={1}
                        max={120}
                        value={form.age}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 120)) {
                            setError('')
                            setForm(p => ({ ...p, age: val }))
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Gender</label>
                      <select
                        value={form.gender}
                        onChange={f('gender')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Blood Group</label>
                      <select
                        value={form.blood_group}
                        onChange={f('blood_group')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select blood group</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder={mode === 'register' ? 'Min. 6 characters' : 'Your password'}
                    minLength={mode === 'register' ? 6 : 1}
                    value={form.password}
                    onChange={f('password')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-black text-sm transition shadow-lg shadow-red-100 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
                    </svg>
                  )}
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                  className="text-red-600 font-bold hover:underline"
                >
                  {mode === 'login' ? 'Register' : 'Sign In'}
                </button>
              </p>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-3">Or continue as guest</p>
                <Link
                  to="/book"
                  className="text-sm font-bold text-gray-600 hover:text-gray-900 underline underline-offset-2"
                >
                  Book without account →
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Emergency? Call <a href="tel:108" className="text-red-600 font-black">108</a> directly — it's free
          </p>
        </div>
      </div>
    </div>
  )
}
