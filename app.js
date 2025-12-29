document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Map
    // Default center: Seoul City Hall
    const defaultLat = 37.5665;
    const defaultLng = 126.9780;
    const map = L.map('map').setView([defaultLat, defaultLng], 13);

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Initialize Marker Cluster Group
    const markers = L.markerClusterGroup({
        chunkedLoading: true, // Performance for large datasets
        maxClusterRadius: 50
    });
    map.addLayer(markers);

    // State
    let allPharmacies = [];
    let currentFiltered = [];
    let userLocation = null;

    // 2. User Geolocation Logic
    function locateUser() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    userLocation = { lat, lng };

                    // Move map
                    map.setView([lat, lng], 15);

                    // Add user marker
                    L.circleMarker([lat, lng], {
                        radius: 8,
                        fillColor: "#3182ce",
                        color: "#fff",
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map).bindPopup("Current Location");
                },
                (error) => {
                    console.warn("Geolocation access denied or failed.", error);
                }
            );
        }
    }

    // Bind Floating Button
    document.getElementById('btn-current-location').addEventListener('click', locateUser);

    // 3. Helper: Check Open Status
    function getOpenStatus(hours) {
        if (!hours) return "Unknown";

        const now = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDay = days[now.getDay()];

        const todayHours = hours[currentDay];
        if (!todayHours || todayHours === "Closed") {
            return "Closed";
        }

        try {
            // Format "HH:mm - HH:mm"
            const [startStr, endStr] = todayHours.split(' - ');
            const currentTime = now.getHours() * 60 + now.getMinutes();

            const [startH, startM] = startStr.split(':').map(Number);
            const [endH, endM] = endStr.split(':').map(Number);

            const startTime = startH * 60 + startM;
            const endTime = endH * 60 + endM;

            if (currentTime >= startTime && currentTime <= endTime) {
                return "Open";
            } else {
                return "Closed";
            }
        } catch (e) {
            return "Unknown";
        }
    }

    // [New] Helper: Check if it is a Night Pharmacy (Open until 22:00+)
    function isNightPharmacy(hours) {
        if (!hours) return false;
        
        const now = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDay = days[now.getDay()];
        const todayHours = hours[currentDay];

        if (!todayHours || todayHours === "Closed") return false;

        try {
            // Format "HH:mm - HH:mm"
            const endStr = todayHours.split(' - ')[1];
            if (!endStr) return false;

            const [endH, endM] = endStr.split(':').map(Number);
            
            // Checks if closing hour is 22 (10 PM) or later
            // Note: Some might close at 24:00 or 01:00 (next day handling is simplified here)
            return endH >= 22 || endH < 6; // Opens late or into early morning
        } catch (e) {
            return false;
        }
    }

    // 4. Create Popup Content
    function createPopupContent(pharmacy) {
        const status = getOpenStatus(pharmacy.operating_hours);
        const statusClass = status === "Open" ? "status-open" : "status-closed";
        
        // Show Night Badge if applicable
        const nightBadge = isNightPharmacy(pharmacy.operating_hours) 
            ? '<span class="badge bg-dark ms-1"><i class="fa-solid fa-moon"></i> Night</span>' 
            : '';

        return `
            <div class="pharmacy-popup" style="min-width: 200px;">
                <h6 class="fw-bold mb-1">${pharmacy.pharmacy_name_en}</h6>
                <div class="small text-muted mb-2">${pharmacy.pharmacy_name_kr}</div>

                <div class="d-flex align-items-start mb-2">
                    <i class="fa-solid fa-location-dot mt-1 me-2 text-success"></i>
                    <span class="small">${pharmacy.address_en}</span>
                </div>

                <div class="mb-2">
                    <i class="fa-solid fa-phone me-2 text-success"></i>
                    <span class="small">${pharmacy.phone || 'N/A'}</span>
                </div>

                <div class="mb-2">
                    <span class="status-badge ${statusClass}">${status}</span>
                    ${nightBadge}
                </div>

                <div class="ad-popup-slot">
                    <small style="font-size: 0.65rem; color: #aaa;">Sponsored</small>
                </div>
            </div>
        `;
    }

    // 5. Render Sidebar List
    const listContainer = document.getElementById('pharmacy-list');

    function renderSidebarList(data) {
        listContainer.innerHTML = '';
        const limit = 50; // Render limit for performance

        const displayData = data.slice(0, limit);

        if (displayData.length === 0) {
            listContainer.innerHTML = '<div class="text-center text-muted mt-5">No pharmacies found with current filters.</div>';
            return;
        }

        displayData.forEach(p => {
            const status = getOpenStatus(p.operating_hours);
            const statusClass = status === "Open" ? "status-open" : "status-closed";
            const isNight = isNightPharmacy(p.operating_hours);

            const card = document.createElement('div');
            card.className = 'pharmacy-card';
            card.innerHTML = `
                <div class="d-flex justify-content-between">
                    <div class="pharmacy-name">${p.pharmacy_name_en}</div>
                    ${isNight ? '<i class="fa-solid fa-moon text-dark" title="Night Pharmacy"></i>' : ''}
                </div>
                <div class="pharmacy-address">${p.address_en}</div>
                <span class="status-badge ${statusClass}">${status}</span>
            `;

            card.addEventListener('click', () => {
                // Zoom to location
                const lat = parseFloat(p.coordinates.y);
                const lng = parseFloat(p.coordinates.x);
                if (!isNaN(lat) && !isNaN(lng)) {
                    map.setView([lat, lng], 17);
                }
            });

            listContainer.appendChild(card);
        });

        if (data.length > limit) {
             const more = document.createElement('div');
             more.className = 'text-center text-muted small mt-2';
             more.innerText = `Showing ${limit} of ${data.length} results.`;
             listContainer.appendChild(more);
        }
    }

    // 6. Render Map Markers (Clustered)
    function renderMarkers(data) {
        markers.clearLayers();

        const markerList = [];

        data.forEach(p => {
            const lat = parseFloat(p.coordinates.y);
            const lng = parseFloat(p.coordinates.x);

            if (!isNaN(lat) && !isNaN(lng)) {
                const marker = L.marker([lat, lng]);
                marker.bindPopup(createPopupContent(p));
                markerList.push(marker);
            }
        });

        markers.addLayers(markerList);
    }

    // 7. Filter Logic (Updated)
    function applyFilters() {
        const query = document.getElementById('search-input').value.toLowerCase();
        
        // UI State
        const regionFilter = document.getElementById('filter-region').value;
        const showOpenOnly = document.getElementById('filter-open').classList.contains('active');
        const showNightOnly = document.getElementById('filter-night').classList.contains('active');

        currentFiltered = allPharmacies.filter(p => {
            // A. Text Search (Name/Address)
            const nameEn = (p.pharmacy_name_en || '').toLowerCase();
            const addrEn = (p.address_en || '').toLowerCase();
            const nameKr = (p.pharmacy_name_kr || '').toLowerCase(); // Search Korean name too
            const matchesText = nameEn.includes(query) || addrEn.includes(query) || nameKr.includes(query);

            if (!matchesText) return false;

            // B. Region Filter (Check Korean Address)
            if (regionFilter) {
                if (!p.address_kr || !p.address_kr.includes(regionFilter)) {
                    return false;
                }
            }

            // C. Button Filters (Mutually Exclusive Logic applied in event listeners)
            if (showOpenOnly) {
                if (getOpenStatus(p.operating_hours) !== "Open") return false;
            }

            if (showNightOnly) {
                if (!isNightPharmacy(p.operating_hours)) return false;
            }

            return true;
        });

        renderSidebarList(currentFiltered);
        renderMarkers(currentFiltered);
    }

    // Event Listeners for Filters
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('filter-region').addEventListener('change', applyFilters);

    // Button Toggle Logic (Mutually Exclusive for easier UX)
    const btnAll = document.getElementById('filter-all');
    const btnOpen = document.getElementById('filter-open');
    const btnNight = document.getElementById('filter-night');

    btnAll.addEventListener('click', () => {
        btnAll.classList.add('active');
        btnOpen.classList.remove('active');
        btnNight.classList.remove('active');
        applyFilters();
    });

    btnOpen.addEventListener('click', () => {
        btnOpen.classList.add('active');
        btnAll.classList.remove('active');
        btnNight.classList.remove('active');
        applyFilters();
    });

    btnNight.addEventListener('click', () => {
        btnNight.classList.add('active');
        btnAll.classList.remove('active');
        btnOpen.classList.remove('active');
        applyFilters();
    });

    // 8. Fetch Data
    fetch('pharmacy_data.json')
        .then(response => response.json())
        .then(data => {
            allPharmacies = data;
            currentFiltered = data;

            // Initial Render
            renderSidebarList(allPharmacies);
            renderMarkers(allPharmacies);

            // Hide Overlay
            document.getElementById('loading-overlay').style.display = 'none';

            // Try locate user initially
            locateUser();
        })
        .catch(err => {
            console.error('Error fetching pharmacy data:', err);
            document.getElementById('loading-overlay').innerHTML =
                '<div class="text-white text-center">Failed to load data.<br>Please try refreshing.</div>';
        });
});