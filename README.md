# 🚑 Rapid Care – Private Ambulance Service Platform

A modern, Rapido-inspired ambulance booking platform for fast and transparent emergency medical transportation.

![Rapid Care](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-brightgreen)

## 🎯 Project Overview

Rapid Care is a full-stack web application that connects patients with nearby ambulances during medical emergencies. Built with modern technologies and inspired by Rapido's clean UI, it provides real-time ambulance booking, tracking, and management.

## ✨ Key Features

### For Patients
- 🆘 **SOS Emergency Button** - One-click ambulance request
- 📍 **Real-time Location** - GPS-based ambulance matching
- 🏥 **Hospital Selection** - Choose pickup and destination
- 💊 **Medical Details** - Specify conditions and requirements
- ⏱️ **Live Updates** - Real-time driver assignment notifications

### For Drivers
- 📱 **Request Dashboard** - View incoming emergency requests
- ✅ **Accept/Reject** - Control over booking acceptance
- 🗺️ **Navigation Info** - Patient location and destination details
- 📞 **Contact Details** - Direct patient communication

### For Admins
- 📊 **Analytics Dashboard** - View system statistics
- 🚑 **Ambulance Management** - Track all ambulances
- 👥 **Driver Management** - Manage driver accounts
- 📋 **Booking History** - Complete booking records

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP requests

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - WebSocket communication
- **MongoDB** - Database
- **Mongoose** - ODM

## 📦 Installation & Setup

### Prerequisites
```bash
node --version  # v16 or higher
npm --version   # v8 or higher
mongod --version # MongoDB installed
```

### Step 1: Install MongoDB (macOS)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Step 2: Clone & Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd rapid-care-project

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 3: Configure Environment
```bash
# Server already has .env file configured
# Default MongoDB URI: mongodb://localhost:27017/rapidcare
```

### Step 4: Run the Application
```bash
# Terminal 1 - Start Backend (from server directory)
cd server
npm run dev

# Terminal 2 - Start Frontend (from client directory)
cd client
npm run dev
```

### Step 5: Access the Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

## 🗄️ Database Schema

### Collections

#### Patients
```javascript
{
  name: String,
  age: Number,
  gender: String,
  phone_number: String,
  blood_group: String,
  medical_condition: String,
  location: { lat: Number, lng: Number }
}
```

#### Ambulances
```javascript
{
  ambulance_number: String,
  ambulance_type: String, // Basic, Oxygen, ICU
  status: String, // available, busy, offline
  location: { lat: Number, lng: Number },
  driver_id: ObjectId
}
```

#### Drivers
```javascript
{
  driver_name: String,
  phone_number: String,
  license_number: String,
  experience: Number,
  status: String, // active, inactive
  ambulance_id: ObjectId
}
```

#### Bookings
```javascript
{
  patient_id: ObjectId,
  ambulance_id: ObjectId,
  driver_id: ObjectId,
  emergency_type: String,
  priority: String,
  status: String, // pending, assigned, completed, cancelled
  pickup_location: String,
  hospital_destination: String,
  location: { lat: Number, lng: Number },
  request_time: Date
}
```

## 🚀 Usage Guide

### Patient Flow
1. Visit homepage at http://localhost:5173
2. Enter pickup location and hospital destination
3. Click "Book Ambulance Now"
4. Fill in patient details and emergency type
5. Submit request and wait for driver assignment
6. Receive driver details and ETA

### Driver Flow
1. Navigate to http://localhost:5173/driver
2. View incoming emergency requests
3. Review patient details and location
4. Accept or reject the request
5. Navigate to patient location

### Admin Flow
1. Navigate to http://localhost:5173/admin
2. View dashboard statistics
3. Monitor all bookings in real-time
4. Manage ambulances and drivers

## 🎨 Design Features

- **Rapido-inspired UI** - Clean, modern interface
- **Responsive Design** - Works on all devices
- **Smooth Animations** - Enhanced user experience
- **Card-based Layout** - Easy to scan information
- **Color-coded Status** - Visual feedback for all states

## 📁 Project Structure

```
rapid-care-project/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── DriverDashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── server/                # Backend Node.js app
│   ├── models/           # Mongoose models
│   │   ├── Patient.js
│   │   ├── Ambulance.js
│   │   ├── Driver.js
│   │   └── Booking.js
│   ├── routes/           # API routes
│   │   ├── patientRoutes.js
│   │   ├── ambulanceRoutes.js
│   │   ├── driverRoutes.js
│   │   └── bookingRoutes.js
│   ├── controllers/      # Route controllers
│   │   └── bookingController.js
│   ├── config/          # Configuration
│   │   └── db.js
│   ├── server.js        # Entry point
│   └── package.json
├── README.md
└── .gitignore
```

## 🔄 Real-time Features

The application uses Socket.io for real-time communication:

- **Emergency Request** - Patient sends SOS → All drivers notified
- **Driver Accept** - Driver accepts → Patient receives driver details
- **Live Updates** - Status changes broadcast to all connected clients

## 📈 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Live ambulance tracking on map (Google Maps API)
- [ ] Payment gateway integration
- [ ] Hospital integration system
- [ ] AI-based ambulance allocation
- [ ] SMS/Email notifications
- [ ] Rating and review system
- [ ] Emergency contact alerts

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB service
brew services start mongodb-community
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 👨‍💻 Contributors

- [Your Name] - Full Stack Developer
- [Team Member 2] - Frontend Developer
- [Team Member 3] - Backend Developer

## 📄 License

MIT License - feel free to use this project for educational purposes.

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@rapidcare.com

---

Made with ❤️ for emergency medical services
# rapid.care
# rapid.care-hack
