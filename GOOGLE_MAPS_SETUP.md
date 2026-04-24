# 🗺️ Google Maps API Setup Guide

## Step 1: Get Google Maps API Key

### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 1.2 Create a New Project
1. Click on the project dropdown at the top
2. Click "New Project"
3. Name it: "Rapid Care"
4. Click "Create"

### 1.3 Enable Required APIs
1. Go to "APIs & Services" > "Library"
2. Search and enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

### 1.4 Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key
4. Click "Restrict Key" (recommended)

### 1.5 Restrict API Key (Optional but Recommended)
**Application Restrictions:**
- Select "HTTP referrers (web sites)"
- Add: `http://localhost:5173/*`
- Add: `https://yourdomain.com/*` (for production)

**API Restrictions:**
- Select "Restrict key"
- Choose:
  - Maps JavaScript API
  - Places API
  - Geocoding API

---

## Step 2: Install Required Packages

```bash
cd client
npm install @react-google-maps/api
```

---

## Step 3: Configure Environment Variables

Create `.env` file in the `client` directory:

```bash
# client/.env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important:** 
- Replace `your_actual_api_key_here` with your actual API key
- Never commit `.env` file to Git
- `.env` is already in `.gitignore`

---

## Step 4: Update package.json

The package should already be added, but verify:

```json
{
  "dependencies": {
    "@react-google-maps/api": "^2.19.2"
  }
}
```

---

## Step 5: Use the LocationSearch Component

### Example 1: In Booking Page

```jsx
import LocationSearch from '../components/LocationSearch'

function BookingPage() {
  const [pickupLocation, setPickupLocation] = useState(null)
  const [destination, setDestination] = useState(null)

  const handlePickupSelect = (location) => {
    console.log('Pickup:', location)
    setPickupLocation(location)
    // location contains:
    // {
    //   location_name: "Supertech Capetown",
    //   address: "Sector 74, Noida, UP",
    //   latitude: 28.5355,
    //   longitude: 77.3910
    // }
  }

  const handleDestinationSelect = (location) => {
    console.log('Destination:', location)
    setDestination(location)
  }

  return (
    <div>
      <LocationSearch
        placeholder="Enter pickup location"
        label="Pickup Location"
        icon="📍"
        onLocationSelect={handlePickupSelect}
      />

      <LocationSearch
        placeholder="Enter destination"
        label="Hospital Destination"
        icon="🏥"
        onLocationSelect={handleDestinationSelect}
      />
    </div>
  )
}
```

### Example 2: In Landing Page

```jsx
import LocationSearch from '../components/LocationSearch'

function LandingPage() {
  const navigate = useNavigate()
  const [pickup, setPickup] = useState(null)
  const [destination, setDestination] = useState(null)

  const handleBooking = () => {
    if (pickup && destination) {
      navigate('/book', { 
        state: { 
          pickup, 
          destination 
        } 
      })
    } else {
      alert('Please select both locations')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
      <LocationSearch
        placeholder="Enter your current location"
        label="Pickup Location"
        onLocationSelect={setPickup}
      />

      <LocationSearch
        placeholder="Enter hospital or destination"
        label="Hospital Destination"
        icon="🏥"
        onLocationSelect={setDestination}
      />

      <button
        onClick={handleBooking}
        className="w-full bg-yellow-400 text-gray-900 py-4 rounded-lg font-bold text-lg hover:bg-yellow-500"
      >
        Book Ambulance Now
      </button>
    </div>
  )
}
```

---

## Step 6: Component Features

### ✅ Features Included

1. **Real-time Autocomplete**
   - Suggestions appear as user types
   - Minimum 3 characters to trigger search

2. **Keyboard Navigation**
   - Arrow Up/Down to navigate suggestions
   - Enter to select
   - Escape to close dropdown

3. **Current Location**
   - "Use Current" button
   - Gets GPS coordinates
   - Reverse geocodes to address

4. **Rapido-style Design**
   - White card dropdown
   - Shadow and border
   - Map pin icons
   - Highlighted selection
   - Smooth animations

5. **Location Data**
   - Location name
   - Full address
   - Latitude
   - Longitude

---

## Step 7: Customization Options

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | string | "Enter location" | Input placeholder text |
| `label` | string | "Location" | Label above input |
| `icon` | string | "📍" | Icon in label |
| `onLocationSelect` | function | - | Callback when location selected |

### Example with Custom Props

```jsx
<LocationSearch
  placeholder="Where do you need the ambulance?"
  label="Emergency Location"
  icon="🚨"
  onLocationSelect={(location) => {
    console.log('Selected:', location)
  }}
/>
```

---

## Step 8: Styling Customization

The component uses Tailwind CSS. You can customize:

```jsx
// Change input style
className="w-full pl-12 pr-4 py-3 border-2 border-red-500 rounded-xl"

// Change dropdown style
className="bg-white rounded-xl shadow-2xl"

// Change selected item style
className="bg-blue-50 border-l-4 border-l-blue-600"
```

---

## Step 9: Country Restriction

By default, it's set to India (`'in'`). Change in LocationSearch.jsx:

```javascript
const request = {
  input: query,
  componentRestrictions: { country: 'us' }, // Change to 'us', 'uk', etc.
}
```

---

## Step 10: Testing

### Test the Component

1. Start your app:
```bash
npm run dev
```

2. Type in the input: "super"

3. You should see suggestions like:
   - Supertech Capetown, Sector 74
   - Supertech Eco Village
   - Supertech Ecovillage 2

4. Click on a suggestion

5. Check console for location data:
```javascript
{
  location_name: "Supertech Capetown",
  address: "Sector 74, Noida, Uttar Pradesh, India",
  latitude: 28.5355161,
  longitude: 77.3910265
}
```

---

## 🐛 Troubleshooting

### Issue: "Google is not defined"
**Solution:** Make sure API key is correct and Maps JavaScript API is enabled

### Issue: No suggestions appearing
**Solution:** 
1. Check if Places API is enabled
2. Verify API key restrictions
3. Check browser console for errors

### Issue: "This API project is not authorized"
**Solution:** 
1. Enable Places API in Google Cloud Console
2. Check API key restrictions
3. Add your domain to allowed referrers

### Issue: Billing not enabled
**Solution:** 
1. Go to Google Cloud Console
2. Enable billing (Google provides $200 free credit)
3. Places API requires billing enabled

---

## 💰 Pricing

Google Maps provides:
- **$200 free credit per month**
- Places Autocomplete: $2.83 per 1000 requests
- Geocoding: $5 per 1000 requests

For development and small projects, the free tier is usually sufficient.

---

## 🔒 Security Best Practices

1. **Never commit API keys to Git**
   ```bash
   # .gitignore already includes
   .env
   .env.local
   ```

2. **Use API key restrictions**
   - Restrict by HTTP referrer
   - Restrict by API

3. **Use environment variables**
   ```javascript
   import.meta.env.VITE_GOOGLE_MAPS_API_KEY
   ```

4. **For production:**
   - Use different API keys for dev/prod
   - Set up proper domain restrictions
   - Monitor usage in Google Cloud Console

---

## 📚 Additional Resources

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [@react-google-maps/api Docs](https://react-google-maps-api-docs.netlify.app/)

---

## ✅ Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Maps JavaScript API
- [ ] Enabled Places API
- [ ] Enabled Geocoding API
- [ ] Created API key
- [ ] Added API key to `.env` file
- [ ] Installed `@react-google-maps/api`
- [ ] Tested LocationSearch component
- [ ] Verified suggestions appear
- [ ] Tested "Use Current Location"
- [ ] Checked location data in console

---

**Your LocationSearch component is ready to use! 🗺️**
