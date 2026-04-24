# 🚀 Run Commands - Real-Time Ambulance Booking System

## Complete System with 3 Applications

---

## 📋 Prerequisites

Make sure you have:
- ✅ MongoDB running
- ✅ Node.js installed
- ✅ 3 terminal windows ready

---

## 🎯 Installation (First Time Only)

### Install Driver Client Dependencies
```bash
cd driver-client
npm install
```

This installs React, Socket.io-client, Tailwind CSS, etc.

---

## 🚀 Run Commands

### Terminal 1: Backend Server
```bash
cd server
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5001
🔌 Socket.io ready for connections
MongoDB Connected: localhost
```

---

### Terminal 2: Patient Web App
```bash
cd client
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

### Terminal 3: Driver Web App
```bash
cd driver-client
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5174/
```

---

## 🌐 Open in Browser

**Patient App:**
```
http://localhost:5173
```

**Driver App:**
```
http://localhost:5174
```

**Admin Dashboard:**
```
http://localhost:5173/admin
```

---

## 🧪 Test the Real-Time System

### Step 1: Setup Driver (5174)
1. Open http://localhost:5174
2. Enter:
   - Driver Name: John Doe
   - Phone: 1234567890
   - Ambulance Number: AMB-1234
3. Click "Start Accepting Rides"
4. You should see "Online" status (green)

### Step 2: Request Ambulance (5173)
1. Open http://localhost:5173
2. Click "Book Ambulance Now"
3. Fill form:
   - Name: Jane Smith
   - Phone: 9876543210
   - Age: 35
   - Emergency: Basic
   - Pickup: 123 Main Street
   - Destination: City Hospital
4. Click "Request Ambulance Now"

### Step 3: Watch Real-Time Magic! ✨
- Driver dashboard shows new request (with beep sound)
- Request card appears with patient details
- Driver clicks "Accept Request"
- Patient instantly sees driver details
- Live location tracking starts

### Step 4: Complete Ride
- Driver clicks "Complete Ride"
- Patient gets notification
- System resets for next booking

---

## 📊 What You Should See

### Server Console:
```
✅ Client connected: abc123
🚗 Driver online: John Doe
👤 Patient online: Jane Smith
🚨 New ambulance request: {...}
📢 Broadcast to 1 drivers
✅ Driver accepted ride: {...}
✅ Ride accepted and patient notified
📍 Location sent: 28.5355, 77.3910
✅ Ride completed: {...}
```

### Driver Dashboard:
- Green "Online" indicator
- New request card with animation
- Patient details
- Accept/Reject buttons
- Active ride section when accepted
- Complete ride button

### Patient App:
- Booking form
- "Searching for ambulance" animation
- Driver details when accepted
- Live location updates
- Call driver button

---

## 🔧 Quick Troubleshooting

### MongoDB Not Running?
```bash
brew services start mongodb-community
```

### Port Already in Use?
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 5174
lsof -ti:5174 | xargs kill -9
```

### Driver Not Receiving Requests?
1. Check "Online" status is green
2. Refresh driver page
3. Check server console for "Driver online" message
4. Check browser console (F12) for Socket.io connection

### Patient Not Seeing Driver?
1. Check server console for "Ride accepted" message
2. Check browser console for Socket.io errors
3. Refresh patient page

---

## 📱 Features to Test

### Real-Time Features:
- ✅ Instant ride request notification
- ✅ Sound notification on driver side
- ✅ Accept/Reject functionality
- ✅ Driver details appear instantly
- ✅ Live location tracking
- ✅ Ride completion notification

### UI Features:
- ✅ Responsive design
- ✅ Animations
- ✅ Loading states
- ✅ Status indicators
- ✅ Call driver button
- ✅ Navigate button

---

## 🎯 System Ports

| Application | Port | URL |
|-------------|------|-----|
| Backend Server | 5001 | http://localhost:5001 |
| Patient Web | 5173 | http://localhost:5173 |
| Driver Web | 5174 | http://localhost:5174 |
| MongoDB | 27017 | mongodb://localhost:27017 |

---

## ✅ Success Checklist

- [ ] MongoDB running
- [ ] Server shows "Socket.io ready"
- [ ] Patient app loads at 5173
- [ ] Driver app loads at 5174
- [ ] Driver can login
- [ ] Driver shows "Online"
- [ ] Patient can submit booking
- [ ] Driver receives notification
- [ ] Driver can accept ride
- [ ] Patient sees driver details
- [ ] Location tracking works
- [ ] Ride can be completed

---

## 🎉 You're Ready!

Your complete real-time ambulance booking system is now running with:
- ✅ Patient web application
- ✅ Driver web application
- ✅ Real-time Socket.io communication
- ✅ Live location tracking
- ✅ MongoDB database

**Test the system and watch the real-time magic happen! 🚑**
