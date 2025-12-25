# Vibing-1: Mobile POI Map

A simple, full-screen mobile Mapbox dark map application for dropping Points of Interest (POIs) and discovering intriguing locations in Tel Aviv.

## Features

✨ **Full-Screen Dark Map** - Beautiful dark-themed Mapbox map optimized for mobile
📍 **Drop POIs** - Tap anywhere on the map to add points of interest
🔍 **Discover Places** - Find unexpected and intriguing locations around your POIs
🗺️ **Mobile-Optimized** - Responsive design that works great on phones and tablets
💾 **Persistent Storage** - POIs are saved locally in your browser
🧭 **Geolocation** - Auto-locate your position on mobile devices
🎨 **Clean UI** - Minimalist interface with intuitive controls

## Quick Start

### 1. Get a Mapbox API Key

1. Go to [mapbox.com](https://www.mapbox.com)
2. Sign up for a free account
3. Navigate to your [account page](https://account.mapbox.com/)
4. Copy your default public token (starts with `pk.`)

### 2. Run the Application

Simply open `index.html` in a web browser:

```bash
# Open directly in browser
open index.html

# Or use a simple HTTP server (recommended for testing)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### 3. Enter Your API Key

On first launch, you'll be prompted to enter your Mapbox API key. This is stored locally in your browser.

## Usage

### Adding POIs

1. Click the **📍 Drop POI** button at the bottom
2. The button will turn blue and your cursor changes to a crosshair
3. Tap anywhere on the map to drop a POI
4. The POI appears as a blue marker with a white center

### Managing POIs

- **Find Nearby**: Click **🔍 Find Nearby** to discover intriguing places around and between your POIs
  - Automatically searches for cafes, restaurants, bars, museums, galleries, parks, historic sites, and more
  - Uses OpenStreetMap data via Overpass API
  - Shows emoji markers for different place types
  - Expands view to show all discovered locations
- **Delete POI**: Click on a POI marker and press the delete button in the popup
- **Clear All**: Click **🗑️ Clear POIs** to remove all POI markers (with confirmation)

### Discovering Intriguing Places

The **Find Nearby** feature searches for unexpected and interesting locations:
- 🎨 Art galleries and artwork installations
- 🏛️ Museums and historic sites
- ☕ Cafes and restaurants with character
- 🍷 Bars and social venues
- 🌳 Parks and viewpoints
- 📚 Libraries, bookshops, and cultural spaces
- 🎭 Theaters and cinemas
- 🏪 Local markets and craft shops

Places are marked with emoji icons and clicking on them reveals details.

### Navigation

- **Pinch to Zoom**: Use two fingers to zoom in/out
- **Pan**: Drag the map with one finger
- **Rotate**: Use two fingers and twist to rotate the map
- **Compass**: Use the navigation controls in the top-right corner
- **Location**: Click the location button to center on your current position

## Technical Details

### Technologies

- **Mapbox GL JS v3.0.1** - Interactive map rendering
- **Overpass API** - OpenStreetMap data for discovering places
- **Vanilla JavaScript** - No framework dependencies
- **LocalStorage** - Client-side POI persistence
- **HTML5 Geolocation API** - User location tracking

### File Structure

```
vibing-1/
├── index.html      # Main HTML structure
├── styles.css      # Responsive CSS styles
├── app.js          # JavaScript application logic
└── README.md       # Documentation
```

### Browser Support

- Modern mobile browsers (iOS Safari, Chrome, Firefox)
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript and LocalStorage enabled

## Customization

### Changing Map Style

Edit `app.js` and modify the map style:

```javascript
style: 'mapbox://styles/mapbox/dark-v11',  // Current dark theme
// Other options:
// 'mapbox://styles/mapbox/streets-v12'    // Streets
// 'mapbox://styles/mapbox/satellite-v9'   // Satellite
// 'mapbox://styles/mapbox/outdoors-v12'   // Outdoors
```

### Changing Default Location

The map defaults to Tel Aviv. Modify the `DEFAULT_CENTER` constant in `app.js`:

```javascript
const DEFAULT_CENTER = [34.7818, 32.0853]; // Tel Aviv
const DEFAULT_ZOOM = 13;
```

### Styling POI Markers

Markers are rendered using SVG. Modify the `renderPOI()` function in `app.js` to customize appearance.

## Future Enhancements

The application is designed to be extended with:

- 🎯 Nearby location discovery (restaurants, cafes, etc.)
- 🏷️ POI categories and filtering
- 📊 Distance and radius calculations
- 🔗 POI sharing via URLs
- 📝 Custom POI names and descriptions
- 🌐 Integration with location APIs (Foursquare, Google Places)

## Development

### Testing Locally

Use a local HTTP server to avoid CORS issues:

```bash
# Python 3
python3 -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

### Clearing Data

To reset the application:
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear LocalStorage for your domain

Or click "🗑️ Clear POIs" in the app.

## License

MIT License - Feel free to use and modify for your needs.

## Credits

Built with ❤️ using Mapbox GL JS
