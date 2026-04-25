import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      {/* Top Banner */}
      <div className="bg-red-600 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-pulse">🚨</div>
            <div>
              <p className="font-black text-lg">Emergency? Call Us Now!</p>
              <p className="text-red-100 text-sm">Available 24/7 across the city</p>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="tel:108" className="bg-white text-red-600 px-6 py-2 rounded-xl font-black text-lg hover:bg-red-50 transition">
              📞 108
            </a>
            <Link to="/book" className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-xl font-black hover:bg-yellow-300 transition">
              Book Online
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-2H9c-.55 0-1-.45-1-1s.45-1 1-1h2V7c0-.55.45-1 1-1z"/>
                </svg>
              </div>
              <div>
                <span className="text-xl font-black">Rapid</span>
                <span className="text-xl font-black text-red-500">Care</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              India's most trusted emergency ambulance service. Fast, reliable, and available 24/7.
            </p>
            <div className="flex gap-3">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <a key={social} href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition text-sm">
                  {social === 'facebook' ? '📘' : social === 'twitter' ? '🐦' : social === 'instagram' ? '📸' : '▶️'}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Services</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              {['Basic Ambulance', 'ICU Ambulance', 'Oxygen Support', 'Patient Transport', 'Hospital Transfer', 'Air Ambulance'].map((s) => (
                <li key={s}>
                  <a href="#" className="hover:text-red-400 transition flex items-center gap-2">
                    <span className="text-red-600">›</span> {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              {['About Us', 'Our Team', 'Careers', 'Press', 'Blog', 'Partner With Us'].map((s) => (
                <li key={s}>
                  <a href="#" className="hover:text-red-400 transition flex items-center gap-2">
                    <span className="text-red-600">›</span> {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-0.5">📞</span>
                <div>
                  <p className="text-white font-bold">Emergency: 108</p>
                  <p>Support: +91 98765 43210</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-0.5">📧</span>
                <div>
                  <p>support@rapidcare.in</p>
                  <p>info@rapidcare.in</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 mt-0.5">📍</span>
                <p>Available in 50+ cities across India</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2024 RapidCare. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
