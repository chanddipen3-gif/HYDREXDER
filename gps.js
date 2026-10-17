// Live GPS Module

function renderGPS() {
    let html = `
        <div class="animate-fade-in space-y-4 h-[calc(100vh-8rem)] flex flex-col">
            <div class="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <div>
                    <h3 class="text-lg font-bold">Field Operations Map</h3>
                    <p class="text-sm text-gray-500">Live view of check-ins and check-outs.</p>
                </div>
                <div class="flex space-x-4 items-center">
                    <span class="flex items-center text-sm"><span class="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> Check-In</span>
                    <span class="flex items-center text-sm"><span class="w-3 h-3 rounded-full bg-green-500 mr-2"></span> Check-Out</span>
                    <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded border" onclick="renderGPS()">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>

            <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg shadow border border-gray-200 dark:border-gray-700 relative overflow-hidden" id="map-container">
                <div id="gps-map" class="w-full h-full"></div>
            </div>
        </div>
    `;

    dom.mainContent.innerHTML = html;

    // Give DOM time to insert container before initializing Leaflet
    setTimeout(initMap, 100);
}

function initMap() {
    const mapEl = document.getElementById('gps-map');
    if(!mapEl) return;

    // Default center (New York for mock data)
    const map = L.map('gps-map').setView([40.7128, -74.0060], 13);

    // Support dark mode tiles if dark mode active
    const isDark = document.documentElement.classList.contains('dark');
    const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const jobs = state.getJobs();
    const users = state.getUsers();

    // Custom icons
    const blueIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='background-color:#3B82F6;width:15px;height:15px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5);'></div>",
        iconSize: [15, 15],
        iconAnchor: [7, 7]
    });

    const greenIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='background-color:#10B981;width:15px;height:15px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5);'></div>",
        iconSize: [15, 15],
        iconAnchor: [7, 7]
    });

    let bounds = [];

    jobs.forEach(job => {
        const emp = users.find(u => u.id === job.employeeId);
        const empName = emp ? emp.name : 'Unknown';

        if(job.checkInGPS) {
            L.marker(job.checkInGPS, {icon: blueIcon}).addTo(map)
                .bindPopup(`<b>${empName}</b><br>Job: ${job.id}<br>Checked In: ${job.checkIn}`);
            bounds.push(job.checkInGPS);
        }
        if(job.checkOutGPS) {
            L.marker(job.checkOutGPS, {icon: greenIcon}).addTo(map)
                .bindPopup(`<b>${empName}</b><br>Job: ${job.id}<br>Checked Out: ${job.checkOut}`);
            bounds.push(job.checkOutGPS);

            // Draw line between check-in and check-out if both exist
            if(job.checkInGPS) {
                L.polyline([job.checkInGPS, job.checkOutGPS], {color: '#9CA3AF', weight: 2, dashArray: '5, 5'}).addTo(map);
            }
        }
    });

    if(bounds.length > 0) {
        map.fitBounds(bounds, {padding: [50, 50]});
    }
}

window.modules = window.modules || {};
window.modules.gps = renderGPS;
