# 🚀 Quick Start Guide - Rapid Care

## For First Time Setup

### 1. Install Prerequisites

**Check if you have Node.js:**
```bash
node --version
```
If not installed, download from: https://nodejs.org/

**Install MongoDB (macOS):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### 2. Install Project Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
You should see: ✅ `Server running on port 5000` and `MongoDB Connected`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
You should see: ✅ `Local: http://localhost:5173/`

### 4. Open in Browser

Navigate to: **http://localhost:5173**

---

## Testing the Application

### Test Patient Booking Flow

1. Go to http://localhost:5173
2. Enter pickup location: "123 Main St"
3. Enter hospital: "City Hospital"
4. Click "Book Ambulance Now"
5. Fill in patient details:
   - Name: John Doe
   - Age: 35
   - Phone: 1234567890
   - Emergency Type: Basic
6. Click "Request Ambulance Now"
7. Wait for driver assignment

### Test Driver Dashboard

1. Open new tab: http://localhost:5173/driver
2. You should see the booking request
3. Click "Accept Request"
4. Patient will receive driver details

### Test Admin Dashboard

1. Open: http://localhost:5173/admin
2. View all bookings and statistics

---

## Common Issues & Solutions

### Issue: MongoDB not running
```bash
brew services start mongodb-community
```

### Issue: Port 5000 already in use
```bash
lsof -ti:5000 | xargs kill -9
```

### Issue: Port 5173 already in use
```bash
lsof -ti:5173 | xargs kill -9
```

### Issue: Dependencies not installed
```bash
# In server directory
rm -rf node_modules package-lock.json
npm install

# In client directory
rm -rf node_modules package-lock.json
npm install
```

---

## Project URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Patient Booking**: http://localhost:5173/book
- **Driver Dashboard**: http://localhost:5173/driver
- **Admin Dashboard**: http://localhost:5173/admin

---

## API Endpoints

### Patients
- `POST /api/patients` - Create patient
- `GET /api/patients` - Get all patients

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all bookings
- `PATCH /api/bookings/:id` - Update booking

### Ambulances
- `POST /api/ambulances` - Create ambulance
- `GET /api/ambulances/available` - Get available ambulances

### Drivers
- `POST /api/drivers` - Create driver
- `GET /api/drivers` - Get all drivers

---

## Need Help?

Check the main README.md for detailed documentation.
