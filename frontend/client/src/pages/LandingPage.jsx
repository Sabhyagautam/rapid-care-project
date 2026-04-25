import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SimpleLocationInput from '../components/SimpleLocationInput'

const SERVICES = [
  { name: 'Basic Life Support', short: 'BLS', desc: 'Trained paramedics with essential emergency equipment for stable transport.', base: 500, perKm: 20, tag: 'Most Booked' },
  { name: 'Advanced Life Support', short: 'ALS / ICU', desc: 'Mobile ICU with ventilator, defibrillator and cardiac monitoring.', base: 2000, perKm: 60, tag: 'Critical Care' },
  { name: 'Oxygen Ambulance', short: 'O₂', desc: 'Oxygen cylinders and respiratory support for breathing emergencies.', base: 800, perKm: 30, tag: null },
  { name: 'Patient Transport', short: 'PTS', desc: 'Non-emergency inter-hospital or discharge transfers.', base: 400, perKm: 15, tag: null },
  { name: 'Trauma Response', short: 'TR', desc: 'Rapid response for road accidents, falls and trauma cases.', base: 600, perKm: 25, tag: null },
  { name: 'Air Ambulance', short: 'AIR', desc: 'Helicopter transport for critical long-distance emergencies.', base: 50000, perKm: 200, tag: 'Premium' },
]

const STEPS = [
  { n: 1, title: 'Enter Location', desc: 'Type your address or tap GPS to auto-detect your position.' },
  { n: 2, title: 'Select Service', desc: 'Choose the ambulance type that matches your emergency.' },
  { n: 3, title: 'Confirm & Dispatch', desc: 'Review fare estimate and confirm. Driver is notified instantly.' },
  { n: 4, title: 'Track Live', desc: 'Watch the ambulance move toward you on a real-time map.' },
]

const STEP_ICONS = [
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2a2 2 0 0 1-2 2h-2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6"><polyline points="20 6 9 17 4 12"/></svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
]

const TRUST = [
  { title: 'Transparent Pricing', desc: 'Fare estimate shown before you confirm. No hidden charges.' },
  { title: 'Real-time GPS', desc: 'Track the ambulance live from dispatch to arrival.' },
  { title: 'Verified Crew', desc: 'All paramedics are trained and carry valid certifications.' },
  { title: 'Cancel Anytime', desc: 'Cancel before the driver arrives — no penalty.' },
  { title: '24/7 Dispatch', desc: 'Requests are processed round the clock, every day.' },
  { title: 'Ride Status', desc: 'Step-by-step status updates from pending to completed.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [pickup, setPickup] = useState(null)
  const [destination, setDestination] = useState(null)

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="pt-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 min-h-[88vh] items-center gap-12 py-16">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-full text-xs font-bold mb-8 uppercase tracking-widest">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block"></span>
                Emergency Response · Available 24/7
              </div>

              <h1 className="text-5xl lg:text-6xl font-black text-gray-950 leading-[1.1] mb-6">
                Ambulance at<br />
                <span className="text-red-600">Your Door</span><br />
                <span className="text-gray-400">in Minutes.</span>
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">
                Book a verified ambulance with real-time tracking and transparent pricing. Designed for genuine emergencies.
              </p>

              {/* Booking widget */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5">Quick Book</p>
                <div className="space-y-3 mb-4">
                  <SimpleLocationInput
                    placeholder="Your current location"
                    label="Pickup"
                    onLocationSelect={setPickup}
                  />
                  <SimpleLocationInput
                    placeholder="Hospital or destination"
                    label="Drop-off"
                    icon="🏥"
                    onLocationSelect={setDestination}
                  />
                </div>
                <button
                  onClick={() => navigate('/book', { state: { pickup, destination } })}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black text-base transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 flex-shrink-0">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
                  </svg>
                  Request Ambulance Now
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Or call free helpline <a href="tel:108" className="text-red-600 font-black">108</a>
                </p>
              </div>
            </div>

            {/* Right — visual card */}
            <div className="hidden lg:flex flex-col gap-4">
              {/* Ambulance card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden border border-slate-700/50 shadow-2xl">
                {/* Glow effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-red-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl"></div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Dispatch</span>
                    </div>
                    <div className="bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                      On Duty
                    </div>
                  </div>

                  {/* Detailed ambulance SVG */}
                  <div className="bg-slate-950/60 rounded-2xl p-4 mb-6 border border-slate-700/40">
                    <svg viewBox="0 0 320 140" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Road */}
                      <rect x="0" y="118" width="320" height="22" rx="0" fill="#0f172a"/>
                      <rect x="0" y="116" width="320" height="4" fill="#1e293b"/>
                      {/* Road markings */}
                      <rect x="20" y="126" width="30" height="3" rx="1.5" fill="#334155"/>
                      <rect x="70" y="126" width="30" height="3" rx="1.5" fill="#334155"/>
                      <rect x="120" y="126" width="30" height="3" rx="1.5" fill="#334155"/>
                      <rect x="170" y="126" width="30" height="3" rx="1.5" fill="#334155"/>
                      <rect x="220" y="126" width="30" height="3" rx="1.5" fill="#334155"/>
                      <rect x="270" y="126" width="30" height="3" rx="1.5" fill="#334155"/>

                      {/* Ambulance body - main box */}
                      <rect x="30" y="48" width="190" height="68" rx="10" fill="white"/>
                      <rect x="30" y="48" width="190" height="68" rx="10" stroke="#e2e8f0" strokeWidth="1.5"/>

                      {/* Cab section */}
                      <path d="M180 48 L220 48 Q240 48 248 58 L258 78 L258 116 L180 116 Z" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>

                      {/* Red stripe along body */}
                      <rect x="30" y="80" width="228" height="8" fill="#ef4444"/>

                      {/* Windshield */}
                      <path d="M184 52 L218 52 Q232 52 238 60 L246 76 L184 76 Z" fill="#bae6fd" fillOpacity="0.7" stroke="#7dd3fc" strokeWidth="1"/>

                      {/* Side windows */}
                      <rect x="38" y="54" width="50" height="22" rx="4" fill="#bae6fd" fillOpacity="0.6" stroke="#7dd3fc" strokeWidth="1"/>
                      <rect x="96" y="54" width="50" height="22" rx="4" fill="#bae6fd" fillOpacity="0.6" stroke="#7dd3fc" strokeWidth="1"/>
                      <rect x="154" y="54" width="22" height="22" rx="4" fill="#bae6fd" fillOpacity="0.6" stroke="#7dd3fc" strokeWidth="1"/>

                      {/* Red cross on body */}
                      <rect x="68" y="88" width="28" height="5" rx="2.5" fill="#ef4444"/>
                      <rect x="79" y="77" width="5" height="28" rx="2.5" fill="#ef4444"/>

                      {/* AMBULANCE text */}
                      <text x="115" y="108" fontSize="9" fontWeight="bold" fill="#1e293b" textAnchor="middle" letterSpacing="2">AMBULANCE</text>

                      {/* Rear doors */}
                      <line x1="125" y1="88" x2="125" y2="116" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,2"/>

                      {/* Siren lights on top */}
                      <rect x="90" y="38" width="60" height="12" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1"/>
                      <rect x="94" y="41" width="16" height="6" rx="3" fill="#ef4444"/>
                      <rect x="114" y="41" width="16" height="6" rx="3" fill="#3b82f6"/>
                      <rect x="134" y="41" width="16" height="6" rx="3" fill="#ef4444"/>
                      {/* Siren glow */}
                      <ellipse cx="102" cy="38" rx="10" ry="5" fill="#ef4444" fillOpacity="0.3"/>
                      <ellipse cx="142" cy="38" rx="10" ry="5" fill="#ef4444" fillOpacity="0.3"/>

                      {/* Front bumper */}
                      <rect x="252" y="100" width="14" height="16" rx="3" fill="#cbd5e1"/>
                      {/* Headlights */}
                      <rect x="250" y="62" width="10" height="14" rx="3" fill="#fef08a"/>
                      <rect x="250" y="62" width="10" height="14" rx="3" fill="#fef08a" fillOpacity="0.5"/>
                      {/* Headlight glow */}
                      <ellipse cx="265" cy="69" rx="12" ry="6" fill="#fef08a" fillOpacity="0.2"/>

                      {/* Rear lights */}
                      <rect x="28" y="90" width="6" height="12" rx="2" fill="#ef4444"/>
                      <rect x="28" y="104" width="6" height="8" rx="2" fill="#fca5a5"/>

                      {/* Wheels */}
                      <circle cx="75" cy="116" r="18" fill="#1e293b"/>
                      <circle cx="75" cy="116" r="12" fill="#334155"/>
                      <circle cx="75" cy="116" r="5" fill="#64748b"/>
                      <circle cx="75" cy="116" r="2" fill="#94a3b8"/>

                      <circle cx="195" cy="116" r="18" fill="#1e293b"/>
                      <circle cx="195" cy="116" r="12" fill="#334155"/>
                      <circle cx="195" cy="116" r="5" fill="#64748b"/>
                      <circle cx="195" cy="116" r="2" fill="#94a3b8"/>

                      <circle cx="245" cy="116" r="16" fill="#1e293b"/>
                      <circle cx="245" cy="116" r="10" fill="#334155"/>
                      <circle cx="245" cy="116" r="4" fill="#64748b"/>
                      <circle cx="245" cy="116" r="1.5" fill="#94a3b8"/>

                      {/* Speed lines */}
                      <line x1="0" y1="70" x2="22" y2="70" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                      <line x1="0" y1="80" x2="16" y2="80" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                      <line x1="0" y1="90" x2="20" y2="90" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Response Time', val: '< 15 min', icon: '⚡' },
                      { label: 'GPS Tracking', val: 'Real-time', icon: '📍' },
                      { label: 'Fare Estimate', val: 'Before booking', icon: '💰' },
                      { label: 'Availability', val: '24 / 7', icon: '🕐' },
                    ].map(s => (
                      <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-lg">{s.icon}</span>
                        <div>
                          <div className="font-black text-sm text-white">{s.val}</div>
                          <div className="text-slate-500 text-xs">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emergency strip */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-red-900/30">
                <div>
                  <p className="font-black text-white text-lg">Life-threatening emergency?</p>
                  <p className="text-red-200 text-sm">Call the national helpline — it's free</p>
                </div>
                <a href="tel:108" className="bg-white text-red-600 font-black px-6 py-3 rounded-xl text-xl hover:bg-red-50 transition flex-shrink-0 shadow-lg">
                  108
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-xl mb-14">
            <p className="text-red-600 text-xs font-black uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl font-black text-gray-950 mb-4">How It Works</h2>
            <p className="text-gray-500">From request to arrival in four steps</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] right-0 h-px bg-gray-200 z-0"></div>
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-red-100">
                    {STEP_ICONS[i]}
                  </div>
                  <h3 className="font-black text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-xl mb-14">
            <p className="text-red-600 text-xs font-black uppercase tracking-widest mb-3">Services</p>
            <h2 className="text-4xl font-black text-gray-950 mb-4">Ambulance Types</h2>
            <p className="text-gray-500">Choose the right service for your situation</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {SERVICES.map((s) => (
              <div key={s.name} className="border border-gray-200 rounded-2xl p-6 hover:border-red-300 hover:shadow-lg transition-all group cursor-pointer relative">
                {s.tag && (
                  <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {s.tag}
                  </span>
                )}
                <div className="w-12 h-12 bg-gray-950 rounded-xl flex items-center justify-center mb-5 text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-6 h-6">
                    {s.name === 'Basic Life Support' && <><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2a2 2 0 0 1-2 2h-2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>}
                    {s.name === 'Advanced Life Support' && <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>}
                    {s.name === 'Oxygen Ambulance' && <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>}
                    {s.name === 'Patient Transport' && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
                    {s.name === 'Trauma Response' && <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>}
                    {s.name === 'Air Ambulance' && <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>}
                  </svg>
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{s.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{s.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="font-black text-gray-900 text-lg">₹{s.base.toLocaleString()}</span>
                    <span className="text-gray-400 text-xs ml-1">base + ₹{s.perKm}/km</span>
                  </div>
                  <button
                    onClick={() => navigate('/book')}
                    className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition"
                  >
                    Book →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST ─── */}
      <section id="safety" className="py-24 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-4">Why Rapid Care</p>
              <h2 className="text-4xl font-black mb-6 leading-tight">
                Built for Real<br />Emergencies
              </h2>
              <p className="text-gray-400 leading-relaxed mb-10">
                We focus on speed, transparency and reliability. No inflated claims — just a system designed to get help to you as fast as possible.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {TRUST.map(f => (
                  <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mb-3"></div>
                    <h4 className="font-bold text-sm text-white mb-1">{f.title}</h4>
                    <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* Fake live dashboard card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-bold text-sm">Dispatch Overview</span>
                  <div className="flex items-center gap-1.5 text-xs text-green-400">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    Live
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Requests Today', val: '—' },
                    { label: 'Avg Response', val: '< 15 min' },
                    { label: 'Active Drivers', val: '—' },
                    { label: 'Completed Rides', val: '—' },
                  ].map(s => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-4">
                      <div className="font-black text-xl text-white">{s.val}</div>
                      <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-600 rounded-2xl p-6">
                <h3 className="font-black text-xl mb-2">Every second counts.</h3>
                <p className="text-red-200 text-sm mb-5">Don't wait. Request an ambulance or call the free helpline now.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/book')}
                    className="flex-1 bg-white text-red-600 py-3 rounded-xl font-black text-sm hover:bg-red-50 transition"
                  >
                    Book Online
                  </button>
                  <a href="tel:108" className="flex-1 bg-yellow-400 text-gray-900 py-3 rounded-xl font-black text-sm hover:bg-yellow-300 transition text-center">
                    Call 108
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
