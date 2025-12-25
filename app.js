// Configuration
const STORAGE_KEY = 'vibing_pois';
const API_KEY_STORAGE = 'mapbox_api_key';
const DEFAULT_CENTER = [-74.006, 40.7128]; // NYC
const DEFAULT_ZOOM = 12;

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
    document.getElementById('findLocationsBtn').addEventListener('click', showPOIList);
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
