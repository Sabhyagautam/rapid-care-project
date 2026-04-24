# 🚑 Rapid Care - Real-Time Ambulance Booking System

## Complete Full-Stack Real-Time System

This is a complete real-time ambulance booking system with separate Patient and Driver applications communicating through Socket.io.

---

## 🏗️ System Architecture

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│  Patient Web    │◄───────►│   Node.js    │◄───────►│   Driver Web    │
│  (Port 5173)    │         │   Server     │         │   (Port 5174)   │
│                 │         │  (Port 5001) │         │                 │
│  Socket.io      │         │  Socket.io   │         │  Socket.io      │
│  Client         │         │  Server      │         │  Client         │
└─────────────────┘         └──────────────┘         └─────────────────┘
                                    │
                                    │
                              ┌─────▼─────┐
                              │  MongoDB  │
                              └───────────┘
```

---

## 📦 Project Structure

```
rapid-care-project/
├── client/                    # Patient Web Application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── RealTimeBooking.jsx  ← NEW
│   │   │   └── AdminDashboard.jsx
│   │   ├── components/
│   │   └── App.jsx
│   └── package.json
│
├── driver-client/             # Driver Web Application (NEW)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DriverLogin.jsx
│   │   │   └── DriverDashboard.jsx
│   │   └── App.jsx
│   └── package.json
│
└── server/                    # Backend Server
    ├── models/
    ├── routes/
    ├── controllers/
    └── server.js              ← Updated with Socket.io
```

---

## 🚀 Installation & Setup

### Step 1: Install Driver Client Dependencies

```bash
cd driver-client
npm install
```

### Step 2: Verify All Dependencies

**Server:**
```bash
cd server
npm list socket.io
```

**Patient Client:**
```bash
cd client
npm list socket.io-client
```

**Driver Client:**
```bash
cd driver-client
npm list socket.io-client
```

---

## 🎯 How to Run the Complete System

You need **3 terminals** running simultaneously:

### Terminal 1: Backend Server
```bash
cd server
npm run dev
```
**Should see:**
```
🚀 Server running on port 5001
🔌 Socket.io ready for connections
MongoDB Connected: localhost
```

### Terminal 2: Patient Web App
```bash
cd client
npm run dev
```
**Should see:**
```
VITE ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Terminal 3: Driver Web App
```bash
cd driver-client
npm run dev
```
**Should see:**
```
VITE ready in xxx ms
➜  Local:   http://localhost:5174/
```

---

## 🧪 Testing the Real-Time System

### Test Flow:

**1. Start Driver App**
- Open: http://localhost:5174
- Enter driver details:
  - Name: John Doe
  - Phone: 1234567890
  - Ambulance: AMB-1234
- Click "Start Accepting Rides"
- You should see "Online" status

**2. Start Patient App**
- Open: http://localhost:5173
- Click "Book Ambulance Now"
- Fill in patient details:
  - Name: Jane Smith
  - Phone: 9876543210
  - Age: 35
  - Emergency Type: Basic
  - Pickup: 123 Main Street
  - Destination: City Hospital
- Click "Request Ambulance Now"

**3. Watch Real-Time Magic! ✨**
- Driver dashboard will show new request (with sound notification)
- Driver clicks "Accept Request"
- Patient sees driver details instantly
- Live location tracking starts

**4. Complete Ride**
- Driver clicks "Complete Ride"
- Patient gets notification
- Booking marked as completed

---

## 🔄 Real-Time Events Flow

### Patient → Server → Driver

**1. Ambulance Request**
```javascript
// Patient emits
socket.emit('ambulanceRequest', {
  patientName, phone, pickupLocation,
  dropLocation, latitude, longitude,
  emergencyType, requestTime
})

// Server broadcasts to all drivers
io.emit('newRideRequest', rideData)
```

**2. Driver Accepts**
```javascript
// Driver emits
socket.emit('acceptRide', {
  driverId, rideId, driverName,
  phone, ambulanceNumber
})

// Server notifies patient
io.emit('rideAccepted', driverInfo)
```

**3. Live Location Tracking**
```javascript
// Driver sends location every few seconds
socket.emit('driverLocation', {
  rideId, latitude, longitude
})

// Server forwards to patient
io.emit('updateDriverLocation', locationData)
```

**4. Ride Completion**
```javascript
// Driver emits
socket.emit('rideCompleted', { rideId })

// Server notifies patient
io.emit('rideCompletedNotification', { rideId })
```

---

## 📊 Socket.io Events Reference

### Server Events (server.js)

| Event | Direction | Description |
|-------|-----------|-------------|
| `driverOnline` | Driver → Server | Driver registers as online |
| `patientOnline` | Patient → Server | Patient registers online |
| `ambulanceRequest` | Patient → Server | New ambulance request |
| `newRideRequest` | Server → All Drivers | Broadcast new request |
| `acceptRide` | Driver → Server | Driver accepts ride |
| `rideAccepted` | Server → Patient | Ride accepted notification |
| `rejectRide` | Driver → Server | Driver rejects ride |
| `driverLocation` | Driver → Server | Live GPS location |
| `updateDriverLocation` | Server → Patient | Forward driver location |
| `rideCompleted` | Driver → Server | Ride completed |
| `rideCompletedNotification` | Server → Patient | Completion notification |
| `rideNoLongerAvailable` | Server → Drivers | Remove accepted ride |

---

## 🎨 UI Features

### Patient App Features
✅ Rapido-style landing page
✅ Real-time booking form
✅ "Searching for ambulance" animation
✅ Driver details display
✅ Live location tracking indicator
✅ Call driver button
✅ Completion notification

### Driver App Features
✅ Driver login page
✅ Online/Offline status indicator
✅ Real-time ride request notifications
✅ Sound notification on new request
✅ Accept/Reject buttons
✅ Active ride display
✅ Navigate to patient button
✅ Complete ride button
✅ Auto location tracking

---

## 🔧 Key Technologies

### Frontend
- React.js 18
- Vite
- Tailwind CSS
- Socket.io Client
- React Router

### Backend
- Node.js
- Express.js
- Socket.io Server
- MongoDB + Mongoose

### Real-Time
- Socket.io for WebSocket communication
- Geolocation API for GPS tracking
- Real-time event broadcasting

---

## 📱 Live Location Tracking

The driver's location is tracked using:

```javascript
navigator.geolocation.watchPosition(
  (position) => {
    socket.emit('driverLocation', {
      rideId,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    })
  },
  { enableHighAccuracy: true }
)
```

Updates are sent every few seconds automatically.

---

## 🐛 Troubleshooting

### Issue: Driver not receiving requests
**Solution:**
1. Check driver is "Online" (green indicator)
2. Check server console for "Driver online" message
3. Verify Socket.io connection in browser console

### Issue: Patient not seeing driver details
**Solution:**
1. Check server console for "Ride accepted" message
2. Verify Socket.io connection
3. Check browser console for errors

### Issue: Location tracking not working
**Solution:**
1. Enable location permission in browser
2. Check browser console for geolocation errors
3. Verify HTTPS (or localhost)

---

## 🔐 Security Notes

- Socket.io CORS configured for localhost
- For production, update CORS settings
- Add authentication for drivers
- Validate all socket events
- Sanitize user inputs

---

## 📈 Future Enhancements

- [ ] Google Maps integration for live tracking
- [ ] Distance calculation
- [ ] ETA calculation
- [ ] Payment integration
- [ ] Rating system
- [ ] Chat between patient and driver
- [ ] Push notifications
- [ ] Mobile apps

---

## 🎯 Quick Reference

**Patient App:** http://localhost:5173
**Driver App:** http://localhost:5174
**Server:** http://localhost:5001

**Test Credentials:**
- Driver: Any name, phone, ambulance number
- Patient: Any details

---

## ✅ System Checklist

- [ ] MongoDB running
- [ ] Server running on port 5001
- [ ] Patient app running on port 5173
- [ ] Driver app running on port 5174
- [ ] Driver logged in and online
- [ ] Socket.io connections established
- [ ] Test booking flow works
- [ ] Real-time updates working
- [ ] Location tracking active

---

**Your complete real-time ambulance booking system is ready! 🚑**

*Two separate web applications communicating in real-time through Socket.io*
