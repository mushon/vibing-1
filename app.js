// Configuration
const STORAGE_KEY = 'vibing_pois';
const API_KEY_STORAGE = 'mapbox_api_key';
const DEFAULT_CENTER = [34.7818, 32.0853]; // Tel Aviv
const DEFAULT_ZOOM = 13;

// State
let map;
let pois = [];
let addPoiMode = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const apiKey = getStoredApiKey();
    
    if (!apiKey) {
        showApiKeyPrompt();
    } else {
        initializeMap(apiKey);
    }
    
    setupEventListeners();
    loadPOIs();
});

// API Key Management
function getStoredApiKey() {
    return localStorage.getItem(API_KEY_STORAGE);
}

function storeApiKey(key) {
    localStorage.setItem(API_KEY_STORAGE, key);
}

function showApiKeyPrompt() {
    document.getElementById('apiKeyPrompt').classList.remove('hidden');
}

function hideApiKeyPrompt() {
    document.getElementById('apiKeyPrompt').classList.add('hidden');
}

// Map Initialization
function initializeMap(apiKey) {
    mapboxgl.accessToken = apiKey;
    
    try {
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/dark-v11',
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            attributionControl: true
        });
        
        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add geolocate control
        const geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        });
        map.addControl(geolocate, 'top-right');
        
        // Map click handler
        map.on('click', (e) => {
            if (addPoiMode) {
                addPOI(e.lngLat);
                toggleAddPoiMode();
            }
        });
        
        map.on('load', () => {
            // Auto-locate user on mobile
            if (window.innerWidth <= 768) {
                geolocate.trigger();
            }
            
            // Render existing POIs
            renderAllPOIs();
        });
        
        map.on('error', (e) => {
            console.error('Map error:', e);
            if (e.error && e.error.message && e.error.message.includes('401')) {
                alert('Invalid Mapbox API key. Please check your token.');
                showApiKeyPrompt();
            }
        });
        
    } catch (error) {
        console.error('Failed to initialize map:', error);
        alert('Failed to initialize map. Please check your API key.');
        showApiKeyPrompt();
    }
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('addPoiBtn').addEventListener('click', toggleAddPoiMode);
    document.getElementById('clearPoisBtn').addEventListener('click', clearAllPOIs);
    document.getElementById('findLocationsBtn').addEventListener('click', findNearbyPlaces);
    document.getElementById('closeListBtn').addEventListener('click', hidePOIList);
    document.getElementById('saveApiKeyBtn').addEventListener('click', saveApiKey);
    
    // Allow Enter key in API key input
    document.getElementById('apiKeyInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveApiKey();
        }
    });
}

function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();
    
    if (!key) {
        alert('Please enter a valid API key');
        return;
    }
    
    if (!key.startsWith('pk.')) {
        alert('Mapbox API keys typically start with "pk."');
        return;
    }
    
    storeApiKey(key);
    hideApiKeyPrompt();
    
    // Initialize map with new key
    initializeMap(key);
}

// POI Mode Toggle
function toggleAddPoiMode() {
    addPoiMode = !addPoiMode;
    const btn = document.getElementById('addPoiBtn');
    
    if (addPoiMode) {
        btn.classList.add('active');
        map.getCanvas().style.cursor = 'crosshair';
    } else {
        btn.classList.remove('active');
        map.getCanvas().style.cursor = '';
    }
}

// POI Management
function addPOI(lngLat) {
    const poi = {
        id: Date.now(),
        lng: lngLat.lng,
        lat: lngLat.lat,
        timestamp: new Date().toISOString(),
        name: `POI ${pois.length + 1}`
    };
    
    pois.push(poi);
    savePOIs();
    renderPOI(poi);
    
    // Show success feedback
    showNotification('POI added!');
}

function renderPOI(poi) {
    if (!map) return;
    
    // Create a custom marker element
    const el = document.createElement('div');
    el.className = 'poi-marker';
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTQiIGZpbGw9IiMwMGI0ZDgiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSI1IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=)';
    el.style.backgroundSize = 'contain';
    el.style.cursor = 'pointer';
    
    // Create popup
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="text-align: center;">
            <h4 style="margin-bottom: 8px;">${poi.name}</h4>
            <p style="font-size: 12px; color: #aaa; margin-bottom: 8px;">
                ${poi.lat.toFixed(5)}, ${poi.lng.toFixed(5)}
            </p>
            <button onclick="deletePOI(${poi.id})" style="
                background: #ff4757;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            ">Delete</button>
        </div>
    `);
    
    // Add marker to map
    const marker = new mapboxgl.Marker(el)
        .setLngLat([poi.lng, poi.lat])
        .setPopup(popup)
        .addTo(map);
    
    // Store marker reference with POI
    poi.marker = marker;
}

function renderAllPOIs() {
    pois.forEach(poi => renderPOI(poi));
}

function deletePOI(id) {
    const poi = pois.find(p => p.id === id);
    if (poi && poi.marker) {
        poi.marker.remove();
    }
    
    pois = pois.filter(p => p.id !== id);
    savePOIs();
    updatePOIList();
    
    showNotification('POI deleted');
}

// Make deletePOI available globally for popup buttons
window.deletePOI = deletePOI;

function clearAllPOIs() {
    if (pois.length === 0) {
        showNotification('No POIs to clear');
        return;
    }
    
    if (confirm(`Delete all ${pois.length} POIs?`)) {
        pois.forEach(poi => {
            if (poi.marker) {
                poi.marker.remove();
            }
        });
        
        pois = [];
        savePOIs();
        updatePOIList();
        
        showNotification('All POIs cleared');
    }
}

// Find Nearby Places
async function findNearbyPlaces() {
    if (pois.length === 0) {
        showNotification('No POIs yet. Click "Drop POI" and tap on the map!');
        return;
    }
    
    showNotification('Searching for intriguing places...');
    
    try {
        // Calculate bounding box around all POIs
        const lats = pois.map(p => p.lat);
        const lngs = pois.map(p => p.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        // Expand bbox slightly for better coverage
        const padding = 0.01;
        const bbox = `${minLat - padding},${minLng - padding},${maxLat + padding},${maxLng + padding}`;
        
        // Query Overpass API for interesting places
        // Focus on unexpected, intriguing categories
        const query = `
            [out:json][timeout:25];
            (
                node["tourism"="artwork"](${bbox});
                node["historic"](${bbox});
                node["tourism"="viewpoint"](${bbox});
                node["leisure"="park"](${bbox});
                node["amenity"="cafe"](${bbox});
                node["amenity"="restaurant"](${bbox});
                node["amenity"="bar"](${bbox});
                node["shop"="books"](${bbox});
                node["shop"="music"](${bbox});
                node["amenity"="library"](${bbox});
                node["amenity"="theatre"](${bbox});
                node["amenity"="cinema"](${bbox});
                node["tourism"="gallery"](${bbox});
                node["tourism"="museum"](${bbox});
                node["amenity"="marketplace"](${bbox});
                node["craft"](${bbox});
                way["tourism"="artwork"](${bbox});
                way["historic"](${bbox});
                way["leisure"="park"](${bbox});
                way["amenity"="cafe"](${bbox});
                way["amenity"="restaurant"](${bbox});
                way["amenity"="bar"](${bbox});
                way["tourism"="gallery"](${bbox});
                way["tourism"="museum"](${bbox});
            );
            out center 100;
        `;
        
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch places');
        }
        
        const data = await response.json();
        const places = data.elements.filter(el => el.tags && el.tags.name && el.tags.name.trim());
        
        if (places.length === 0) {
            showNotification('No interesting places found nearby. Try adding more POIs!');
            return;
        }
        
        // Clear existing place markers
        if (window.placeMarkers) {
            window.placeMarkers.forEach(marker => marker.remove());
        }
        window.placeMarkers = [];
        
        // Add markers for discovered places
        places.forEach(place => {
            const lat = place.lat || (place.center && place.center.lat);
            const lng = place.lon || (place.center && place.center.lon);
            
            // Skip if we don't have valid coordinates
            if (!lat || !lng) return;
            
            const name = place.tags.name;
            const type = getPlaceType(place.tags);
            const emoji = getPlaceEmoji(place.tags);
            
            // Create custom marker for places
            const el = document.createElement('div');
            el.className = 'place-marker';
            el.innerHTML = emoji;
            el.style.fontSize = '24px';
            el.style.cursor = 'pointer';
            el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))';
            
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div style="text-align: center; min-width: 150px;">
                    <div style="font-size: 24px; margin-bottom: 8px;">${emoji}</div>
                    <h4 style="margin-bottom: 8px;">${name}</h4>
                    <p style="font-size: 12px; color: #00b4d8; margin-bottom: 4px;">
                        ${type}
                    </p>
                    <p style="font-size: 11px; color: #aaa;">
                        ${lat.toFixed(5)}, ${lng.toFixed(5)}
                    </p>
                </div>
            `);
            
            const marker = new mapboxgl.Marker(el)
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(map);
            
            window.placeMarkers.push(marker);
        });
        
        showNotification(`Found ${places.length} intriguing places! 🎉`);
        
        // Fit map to show all POIs and discovered places
        const allCoords = [
            ...pois.map(p => [p.lng, p.lat]),
            ...places.map(p => {
                const lng = p.lon || (p.center && p.center.lon);
                const lat = p.lat || (p.center && p.center.lat);
                return [lng, lat];
            }).filter(coord => coord[0] && coord[1])
        ];
        const bounds = allCoords.reduce((bounds, coord) => {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(allCoords[0], allCoords[0]));
        
        map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
        });
        
    } catch (error) {
        console.error('Error finding places:', error);
        showNotification('Error finding places. Please try again.');
    }
}

function getPlaceType(tags) {
    if (tags.tourism) return tags.tourism.replace('_', ' ');
    if (tags.historic) return `historic ${tags.historic}`;
    if (tags.amenity) return tags.amenity;
    if (tags.leisure) return tags.leisure;
    if (tags.shop) return `${tags.shop} shop`;
    if (tags.craft) return tags.craft;
    return 'interesting place';
}

function getPlaceEmoji(tags) {
    // Tourism
    if (tags.tourism === 'artwork') return '🎨';
    if (tags.tourism === 'viewpoint') return '👁️';
    if (tags.tourism === 'gallery') return '🖼️';
    if (tags.tourism === 'museum') return '🏛️';
    
    // Historic
    if (tags.historic) return '🏛️';
    
    // Leisure
    if (tags.leisure === 'park') return '🌳';
    
    // Food & Drink
    if (tags.amenity === 'cafe') return '☕';
    if (tags.amenity === 'restaurant') return '🍽️';
    if (tags.amenity === 'bar') return '🍷';
    
    // Culture
    if (tags.amenity === 'library') return '📚';
    if (tags.amenity === 'theatre') return '🎭';
    if (tags.amenity === 'cinema') return '🎬';
    
    // Shopping
    if (tags.shop === 'books') return '📖';
    if (tags.shop === 'music') return '🎵';
    if (tags.amenity === 'marketplace') return '🏪';
    
    // Craft
    if (tags.craft) return '🛠️';
    
    return '📍';
}

// POI List UI
function showPOIList() {
    if (pois.length === 0) {
        showNotification('No POIs yet. Click "Drop POI" and tap on the map!');
        return;
    }
    
    updatePOIList();
    document.getElementById('poiList').classList.remove('hidden');
}

function hidePOIList() {
    document.getElementById('poiList').classList.add('hidden');
}

function updatePOIList() {
    const content = document.getElementById('poiListContent');
    
    if (pois.length === 0) {
        content.innerHTML = '<p style="color: #999;">No POIs added yet</p>';
        return;
    }
    
    content.innerHTML = pois.map(poi => `
        <div class="poi-item">
            <div class="info">
                <div>${poi.name}</div>
                <div class="coords">${poi.lat.toFixed(5)}, ${poi.lng.toFixed(5)}</div>
            </div>
            <button class="delete-btn" onclick="deletePOI(${poi.id})">Delete</button>
        </div>
    `).join('');
}

// Storage
function savePOIs() {
    const dataToSave = pois.map(poi => ({
        id: poi.id,
        lng: poi.lng,
        lat: poi.lat,
        timestamp: poi.timestamp,
        name: poi.name
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

function loadPOIs() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            pois = JSON.parse(stored);
        } catch (e) {
            console.error('Failed to load POIs:', e);
            pois = [];
        }
    }
}

// Notifications
function showNotification(message) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'notification slide-down';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('slide-down');
        notification.classList.add('slide-up');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}
