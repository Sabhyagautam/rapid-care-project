import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import RealTimeBooking from './pages/RealTimeBooking'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'

// Soft guard — redirects to login if no userInfo, but allows guest via /book directly
function RequireAuth({ children }) {
  const user = localStorage.getItem('userInfo')
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/book" element={<RealTimeBooking />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
