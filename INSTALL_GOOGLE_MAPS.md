# 🗺️ Quick Install - Google Maps Location Search

## Step 1: Install the Package

```bash
cd client
npm install @react-google-maps/api
```

## Step 2: Get Google Maps API Key

### Option A: Quick Test (Use Demo Key - Limited)
I've added a demo key in `.env` file. This is for testing only.

### Option B: Get Your Own Key (Recommended)

1. Go to: https://console.cloud.google.com/
2. Create a new project: "Rapid Care"
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials → API Key
5. Copy your API key

## Step 3: Add API Key to .env

Edit `client/.env`:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## Step 4: Restart the Frontend

```bash
# Stop the frontend (Ctrl+C)
# Then restart:
npm run dev
```

## Step 5: Test It!

1. Go to http://localhost:5173
2. Type in the pickup location: "super"
3. You should see suggestions like:
   - Supertech Capetown
   - Supertech Eco Village
   - etc.

## ✅ Features

✅ Real-time location autocomplete
✅ Google Maps Places API integration
✅ "Use Current Location" button
✅ Keyboard navigation (Arrow keys, Enter, Escape)
✅ Rapido-style dropdown design
✅ Returns: location_name, address, latitude, longitude

## 🎯 Usage Example

The LocationSearch component is already integrated in:
- Landing Page (Hero section)
- Booking Page (Pickup & Destination)

When user selects a location, you get:
```javascript
{
  location_name: "Supertech Capetown",
  address: "Sector 74, Noida, Uttar Pradesh, India",
  latitude: 28.5355161,
  longitude: 77.3910265
}
```

## 🐛 Troubleshooting

**No suggestions appearing?**
- Check if API key is correct in `.env`
- Make sure Places API is enabled
- Restart the frontend server

**"Google is not defined" error?**
- Wait a few seconds for Google Maps to load
- Check browser console for errors
- Verify API key is valid

**Billing error?**
- Google Maps requires billing enabled
- You get $200 free credit per month
- Enable billing in Google Cloud Console

## 📚 Full Documentation

See `GOOGLE_MAPS_SETUP.md` for complete setup guide.

---

**Your location search is ready! 🚀**
