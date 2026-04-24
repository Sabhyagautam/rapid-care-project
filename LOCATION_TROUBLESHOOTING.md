# 🔧 Location Search Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: No Suggestions Appearing

**Symptoms:**
- Type in the input but no dropdown appears
- No suggestions show up

**Solutions:**

#### Solution A: Check Browser Console
1. Open browser (F12)
2. Go to Console tab
3. Look for errors like:
   - "Google Maps API Key exists: false"
   - "RefererNotAllowedMapError"
   - "ApiNotActivatedMapError"

#### Solution B: Verify API Key
```bash
# Check if .env file exists
ls client/.env

# View the API key (should not be empty)
cat client/.env
```

Should show:
```
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

#### Solution C: Restart Frontend
After adding/changing API key:
```bash
# Stop frontend (Ctrl+C)
# Then restart:
cd client
npm run dev
```

---

### Issue 2: "Google Maps API Error"

**Symptoms:**
- Red error box appears
- Says "Failed to load Google Maps"

**Solutions:**

#### Check 1: API Key Format
Make sure your `.env` file has:
```bash
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

NOT:
```bash
GOOGLE_MAPS_API_KEY=your_key_here  # ❌ Wrong - missing VITE_
```

#### Check 2: Enable Required APIs
Go to: https://console.cloud.google.com/apis/library

Enable these 3 APIs:
1. ✅ Maps JavaScript API
2. ✅ Places API  
3. ✅ Geocoding API

#### Check 3: Billing Enabled
Google Maps requires billing enabled (you get $200 free credit):
1. Go to: https://console.cloud.google.com/billing
2. Enable billing
3. Add payment method

---

### Issue 3: "RefererNotAllowedMapError"

**Symptoms:**
- Console shows: "This API project is not authorized to use this API"
- Or: "RefererNotAllowedMapError"

**Solution:**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your API key
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add: `http://localhost:5173/*`
   - Add: `http://localhost:*`
4. Click "Save"
5. Wait 5 minutes for changes to propagate

---

### Issue 4: Using Fallback (No Google Maps)

If you want to test WITHOUT Google Maps API:

**Option 1: Use SimpleLocationInput**

Replace in your pages:
```jsx
// Instead of:
import LocationSearch from '../components/LocationSearch'

// Use:
import SimpleLocationInput from '../components/SimpleLocationInput'

// Then use:
<SimpleLocationInput
  placeholder="Enter location"
  label="Pickup Location"
  onLocationSelect={handleSelect}
/>
```

**Option 2: Manual Input**
Just use regular input fields temporarily:
```jsx
<input
  type="text"
  placeholder="Enter pickup location"
  onChange={(e) => setPickup({
    location_name: e.target.value,
    address: e.target.value,
    latitude: 0,
    longitude: 0
  })}
/>
```

---

### Issue 5: "Use Current" Button Not Working

**Symptoms:**
- Click "Use Current" but nothing happens
- Or shows "Unable to get your location"

**Solutions:**

#### Solution A: Enable Location Permission
1. Click the lock icon in browser address bar
2. Set Location to "Allow"
3. Refresh page
4. Try again

#### Solution B: Use HTTPS (for production)
Geolocation requires HTTPS in production:
- Localhost works with HTTP
- Production needs HTTPS

---

### Issue 6: Wrong Country Results

**Symptoms:**
- Getting results from wrong country
- Want to change from India to another country

**Solution:**

Edit `client/src/components/LocationSearch.jsx`, line ~45:
```javascript
componentRestrictions: { country: 'us' } // Change 'in' to your country code
```

Country codes:
- `'in'` - India
- `'us'` - United States
- `'uk'` - United Kingdom
- `'ca'` - Canada
- `'au'` - Australia

---

## Quick Diagnostic Commands

### Check if API key is set:
```bash
cd client
cat .env | grep VITE_GOOGLE_MAPS_API_KEY
```

### Check if package is installed:
```bash
cd client
npm list @react-google-maps/api
```

### Reinstall if needed:
```bash
cd client
npm install @react-google-maps/api
```

### Clear cache and restart:
```bash
cd client
rm -rf node_modules/.vite
npm run dev
```

---

## Testing Steps

### Step 1: Check Console Logs
Open browser console (F12) and look for:
```
Google Maps API Key exists: true
Google Maps loaded: true
```

### Step 2: Type in Input
Type at least 3 characters (e.g., "super")

### Step 3: Check Console Again
Should see:
```
Autocomplete status: OK
Predictions: Array(5) [...]
```

### Step 4: Click Suggestion
Click any suggestion and check console:
```
Location selected: {
  location_name: "...",
  address: "...",
  latitude: ...,
  longitude: ...
}
```

---

## Get Your Own API Key

### Step-by-Step:

1. **Go to Google Cloud Console**
   https://console.cloud.google.com/

2. **Create Project**
   - Click "Select a project" → "New Project"
   - Name: "Rapid Care"
   - Click "Create"

3. **Enable APIs**
   Go to "APIs & Services" → "Library"
   
   Enable these:
   - Maps JavaScript API
   - Places API
   - Geocoding API

4. **Create API Key**
   - Go to "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the key

5. **Add to .env**
   ```bash
   # client/.env
   VITE_GOOGLE_MAPS_API_KEY=paste_your_key_here
   ```

6. **Restart Frontend**
   ```bash
   cd client
   npm run dev
   ```

---

## Alternative: Use Without Google Maps

If you don't want to use Google Maps API, use the simple version:

### Update LandingPage.jsx:
```jsx
import SimpleLocationInput from '../components/SimpleLocationInput'

// Replace LocationSearch with SimpleLocationInput
<SimpleLocationInput
  placeholder="Enter pickup location"
  label="Pickup Location"
  onLocationSelect={setPickup}
/>
```

### Update BookingPage.jsx:
```jsx
import SimpleLocationInput from '../components/SimpleLocationInput'

// Replace LocationSearch with SimpleLocationInput
<SimpleLocationInput
  placeholder="Enter pickup location"
  label="Pickup Location"
  onLocationSelect={setPickupLocation}
/>
```

---

## Still Not Working?

### Check These:

1. ✅ MongoDB is running
2. ✅ Backend server is running (port 5000)
3. ✅ Frontend is running (port 5173)
4. ✅ No console errors
5. ✅ API key is in `.env` file
6. ✅ APIs are enabled in Google Cloud
7. ✅ Billing is enabled
8. ✅ Frontend was restarted after adding API key

### Debug Mode:

Add this to see what's happening:
```jsx
<LocationSearch
  placeholder="Enter location"
  onLocationSelect={(location) => {
    console.log('SELECTED:', location)
    alert(JSON.stringify(location, null, 2))
  }}
/>
```

---

## Contact for Help

If still having issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. Google Cloud Console for API usage

---

**Most common fix: Restart frontend after adding API key!**

```bash
# Stop frontend (Ctrl+C)
cd client
npm run dev
```
