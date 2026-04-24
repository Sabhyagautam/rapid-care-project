import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DriverDashboard from './pages/DriverDashboard'
import DriverLogin from './pages/DriverLogin'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<DriverLogin />} />
          <Route path="/dashboard" element={<DriverDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
