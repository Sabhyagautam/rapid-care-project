# 🧪 Testing Guide - Real-Time Features

## ✅ What's Been Fixed

1. **GPS Location** - "Use Current" button now works properly
2. **Real-time Communication** - Driver receives requests instantly
3. **Live Tracking** - Patient sees driver location updates
4. **Rejection Handling** - Patient notified if driver rejects

---

## 🚀 How to Test

### Step 1: Start All Services

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```
✅ Should see: "Server running on port 5002"

**Terminal 2 - Patient App:**
```bash
cd client
npm run dev
```
✅ Should see: "Local: http://localhost:5173"

**Terminal 3 - Driver App:**
```bash
cd driver-client
npm run dev
```
✅ Should see: "Local: http://localhost:5174"

---

### Step 2: Setup Driver

1. Open: **http://localhost:5174**
2. Enter:
   - Driver Name: John Doe
   - Phone: 1234567890
   - Ambulance: AMB-1234
3. Click "Start Accepting Rides"
4. ✅ Should see green "Online" status

**Check Server Console:**
```
✅ Client connected: xyz123
🚗 Driver online: John Doe
```

---

### Step 3: Test GPS Location (Patient)

1. Open: **http://localhost:5173**
2. Click "Book Ambulance Now"
3. Fill patient details:
   - Name: Jane Smith
   - Phone: 9876543210
   - Age: 35
   - Emergency: Basic
4. **For Pickup Location:**
   - Click "📍 Use Current" button
   - Allow location access in browser
   - ✅ Should see: "Current Location (lat, lng)"
5. **For Destination:**
   - Type: "City Hospital"
   - Or click "Use Current" again

**Browser Console (F12):**
```
✅ Connected to server: abc123
📤 Sending booking request...
✅ Patient created: {...}
📤 Emitting ambulanceRequest: {...}
```

---

### Step 4: Test Real-Time Request

**After clicking "Request Ambulance Now":**

**Patient Side:**
- ✅ Shows "Finding Nearest Ambulance..." animation
- ✅ Displays pickup and destination

**Driver Side (5174):**
- ✅ Hears beep sound notification
- ✅ New request card appears with animation
- ✅ Shows patient details
- ✅ Shows pickup/destination
- ✅ Shows Accept/Reject buttons

**Server Console:**
```
🚨 New ambulance request: {...}
✅ Booking created in DB: 67abc123...
📢 Broadcast to 1 drivers
```

---

### Step 5: Test Accept Flow

**Driver clicks "Accept Request":**

**Driver Side:**
- ✅ Request moves to "Active Ride" section
- ✅ Shows "Complete Ride" button
- ✅ Shows "Navigate" button
- ✅ Starts sending GPS location

**Patient Side:**
- ✅ Instantly shows "Ambulance Confirmed!"
- ✅ Displays driver details
- ✅ Shows live map section
- ✅ Shows "Call Driver" button
- ✅ Shows "Track on Maps" button

**Server Console:**
```
✅ Driver accepted ride: {...}
✅ Ride accepted and patient notified
```

**Browser Console (Patient):**
```
✅ Ride accepted: {driverName: "John Doe", ...}
📍 Driver location update: {latitude: ..., longitude: ...}
```

---

### Step 6: Test Live Location Tracking

**Automatic (every few seconds):**

**Driver Side:**
- GPS location sent automatically
- Console shows: "📍 Location sent: lat, lng"

**Patient Side:**
- Map updates with driver location
- Shows "🚑 Driver is moving"
- Shows "Last update: time"
- Blue pulsing indicator

**Server Console:**
```
📍 Location forwarded to patient
```

---

### Step 7: Test Rejection (Optional)

**Instead of Accept, driver clicks "Reject":**

**Patient Side:**
- ✅ Shows "❌ Ride Cancelled"
- ✅ Shows "Searching for another driver..."
- ✅ Goes back to searching state

**Server Console:**
```
❌ Driver rejected ride: {...}
📢 Notified patient of rejection
```

---

### Step 8: Test Complete Ride

**Driver clicks "Complete Ride":**

**Driver Side:**
- ✅ Shows success alert
- ✅ Clears active ride
- ✅ Ready for next request

**Patient Side:**
- ✅ Shows "Ride completed!" alert
- ✅ Redirects to home page

**Server Console:**
```
✅ Ride completed: {...}
✅ Ride marked as completed
```

---

## 🔍 Debugging Checklist

### Issue: GPS Location Not Working

**Check:**
- [ ] Browser has location permission
- [ ] Using HTTPS or localhost
- [ ] Browser console for errors
- [ ] Try different browser

**Fix:**
```
Chrome: Settings → Privacy → Location → Allow
Firefox: Preferences → Privacy → Permissions → Location
```

---

### Issue: Driver Not Receiving Requests

**Check:**
- [ ] Driver shows "Online" (green)
- [ ] Server console shows "Driver online"
- [ ] Patient console shows "Emitting ambulanceRequest"
- [ ] Server console shows "Broadcast to X drivers"

**Fix:**
1. Refresh driver page
2. Check Socket.io connection in console
3. Restart server

---

### Issue: Patient Not Seeing Driver

**Check:**
- [ ] Server console shows "Ride accepted"
- [ ] Patient console shows "Ride accepted"
- [ ] Socket.io connected on patient side

**Fix:**
1. Check browser console for errors
2. Verify Socket.io connection
3. Refresh patient page

---

### Issue: Live Location Not Updating

**Check:**
- [ ] Driver has location permission
- [ ] Console shows "Location sent"
- [ ] Patient console shows "Driver location update"

**Fix:**
1. Enable location in browser
2. Check console for geolocation errors
3. Try "Use Current" button on driver side

---

## 📊 Expected Console Outputs

### Server Console:
```
🚀 Server running on port 5002
🔌 Socket.io ready for connections
MongoDB Connected: localhost
✅ Client connected: abc123
🚗 Driver online: John Doe
✅ Client connected: xyz789
👤 Patient online: Jane Smith
🚨 New ambulance request: {...}
✅ Booking created in DB: 67abc...
📢 Broadcast to 1 drivers
✅ Driver accepted ride: {...}
✅ Ride accepted and patient notified
📍 Location forwarded to patient
✅ Ride completed: {...}
```

### Patient Console (F12):
```
✅ Connected to server: xyz789
📤 Sending booking request...
✅ Patient created: {...}
📤 Emitting ambulanceRequest: {...}
✅ Ride accepted: {...}
📍 Driver location update: {...}
```

### Driver Console (F12):
```
✅ Connected to server: abc123
🚨 New ride request: {...}
✅ Accepting ride: {...}
📍 Location sent: 28.5355, 77.3910
```

---

## ✅ Success Criteria

- [ ] GPS location works on patient side
- [ ] Driver receives request with sound
- [ ] Accept button works
- [ ] Patient sees driver details instantly
- [ ] Live location updates every few seconds
- [ ] Map shows driver location
- [ ] Call driver button works
- [ ] Track on maps button works
- [ ] Reject shows cancellation message
- [ ] Complete ride works

---

## 🎯 Key Features Working

✅ Real-time Socket.io communication
✅ GPS location capture
✅ Live location tracking
✅ Sound notifications
✅ Accept/Reject flow
✅ Cancellation handling
✅ Google Maps integration
✅ Call driver functionality
✅ Ride completion

---

**Your complete real-time system is now fully functional! 🚑**
