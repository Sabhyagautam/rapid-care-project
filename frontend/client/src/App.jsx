import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RealTimeBooking from './pages/RealTimeBooking'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'
import DriverLogin from './pages/DriverLogin'
import DriverDashboard from './pages/DriverDashboard'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Patient routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/book" element={<RealTimeBooking />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Driver routes */}
          <Route path="/driver" element={<DriverLogin />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
