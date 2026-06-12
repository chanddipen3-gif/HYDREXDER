// Default initial places to showcase on homepage
const defaultPlaces = [
    { name: "Taj Mahal", info: "The Taj Mahal is an ivory-white marble mausoleum on the south bank of the Yamuna river in the Indian city of Agra. It stands as a universal symbol of love.", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80" },
    { name: "Goa", info: "Goa is a coastal state in southwestern India, famous globally for its white sand beaches, vibrant nightlife, ancient churches, and rich Portuguese heritage.", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80" },
    { name: "Manali", info: "Manali is a breathtaking high-altitude resort town nestled in the mountains of Himachal Pradesh, renowned for its snow-capped peaks and adventure sports.", img: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=400&q=80" }
];

const placesGrid = document.getElementById('placesGrid');

// Initial loading configuration
function loadDefaultPlaces() {
    placesGrid.classList.remove('single-result');
    placesGrid.innerHTML = "";
    defaultPlaces.forEach(place => {
        placesGrid.innerHTML += createCardHTML(place.name, place.info, place.img);
    });
}

// Generate premium search result cards
function createCardHTML(name, info, imgUrl) {
    const googleMapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(name)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

    return `
        <div class="card">
            <img src="${imgUrl}" alt="${name}">
            <div class="card-body">
                <h3>${name}</h3>
                <div class="place-meta">
                    <span>⏱️ Best Time: Oct to Mar</span>
                    <span>🌤️ Weather: Pleasant</span>
                </div>
                <p>${info}</p>
                <div class="map-container">
                    <iframe src="${googleMapEmbedUrl}" allowfullscreen loading="lazy"></iframe>
                </div>
                <br>
                <div class="booking-buttons">
                    <button class="book-btn bus" onclick="redirectBooking('Bus', '${name}')">🚌 Bus Info</button>
                    <button class="book-btn hotel" onclick="redirectBooking('Hotel', '${name}')">🏨 Book Hotel</button>
                    <button class="book-btn car" onclick="redirectBooking('Car', '${name}')">🚗 Rent Car</button>
                </div>
                <button class="share-btn" onclick="shareOnWhatsApp('${name}')">🟢 Share on WhatsApp</button>
            </div>
        </div>
    `;
}

// Route users to specific ticketing engines
function searchDirectBus() {
    const from = document.getElementById('busFrom').value.trim();
    const to = document.getElementById('busTo').value.trim();
    if (!from || !to) { 
        alert("Please specify both starting point and destination!"); 
        return; 
    }
    window.open(`https://www.redbus.in/bus-tickets/${from.toLowerCase()}-to-${to.toLowerCase()}`, "_blank");
}

// WhatsApp viral utility configuration
function shareOnWhatsApp(placeName) {
    const message = `Hey! Check out complete travel guides, live maps, and online booking options for ${placeName} directly on HYDREXDER!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
}

// Wikipedia API handling system
async function handleSearch(event) {
    event.preventDefault();
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    const loadingDiv = document.getElementById('loading');
    const resultTitle = document.getElementById('resultTitle');
    
    loadingDiv.style.display = 'block'; 
    placesGrid.innerHTML = "";
    resultTitle.innerText = `Results for "${query}"`;

    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Destination not found");
        
        const data = await response.json();
        placesGrid.classList.add('single-result');
        placesGrid.innerHTML = createCardHTML(data.title, data.extract || "No description available.", data.originalimage ? data.originalimage.source : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80");
    } catch (error) {
        placesGrid.classList.remove('single-result');
        placesGrid.innerHTML = `<p style='text-align:center; width:100%; color:red; font-size:18px;'>Sorry! No such place found on the network. Please verify spelling.</p>`;
    } finally { 
        loadingDiv.style.display = 'none'; 
    }
}

function redirectBooking(type, placeName) {
    let url = "";
    if (type === "Bus") url = "https://www.redbus.in";
    else if (type === "Hotel") url = "https://www.makemytrip.com";
    else if (type === "Car") url = "https://www.zoomcar.com";
    if (url) window.open(url, "_blank");
}

/* --- Chatbot Interface Automation --- */
function toggleChatbot() {
    const chatContainer = document.getElementById('chatbotContainer');
    chatContainer.style.display = (chatContainer.style.display === 'flex') ? 'none' : 'flex';
}

function checkBotEnter(event) { 
    if (event.key === 'Enter') sendBotMessage(); 
}

function sendBotMessage() {
    const inputEl = document.getElementById('botInput');
    const msgText = inputEl.value.trim();
    if (!msgText) return;

    const msgContainer = document.getElementById('chatbotMessages');
    msgContainer.innerHTML += `<div class="user-msg">${msgText}</div>`;
    inputEl.value = "";
    msgContainer.scrollTop = msgContainer.scrollHeight;

    setTimeout(() => {
        let reply = "";
        const lowerTxt = msgText.toLowerCase();

        if (lowerTxt.includes('bus') || lowerTxt.includes('ticket') || lowerTxt.includes('transport')) {
            reply = "You can easily input your details in our 'Find Direct Buses' widget right below the header to explore real-time routes!";
        } else if (lowerTxt.includes('hotel') || lowerTxt.includes('stay') || lowerTxt.includes('room')) {
            reply = "To book a luxury hotel, simply query the destination in the main search bar and trigger the MakeMyTrip redirect.";
        } else if (lowerTxt.includes('hi') || lowerTxt.includes('hello')) {
            reply = "Hello! Welcome to HYDREXDER premium travel desk. How may I assist your travel setup today?";
        } else {
            reply = "Fantastic topic! Please process this query directly inside the main upper search form to populate live coordinates and wiki descriptions.";
        }

        msgContainer.innerHTML += `<div class="bot-msg">${reply}</div>`;
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 600);
}

/* Authentication Layout Modals */
function openModal() { document.getElementById('loginModal').style.display = 'block'; }
function closeModal() { document.getElementById('loginModal').style.display = 'none'; }

// Init configuration
loadDefaultPlaces();
// 1. मैप को इनिशियलाइज़ करें
const map = L.map('map').setView([24.0, 78.0], 5);

// OpenStreetMap लेयर लोड करें
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// एनीमेशन और मार्केट्स के लिए वेरिएबल्स
let startMarker, endMarker, routeLine, carMarker;
let animationId;

// नाम से कोऑर्डिनेट्स (Numbers) पता करने वाला फंक्शन (Geocoding API)
async function getCoordinates(placeName) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`);
    const data = await response.json();
    if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
}

// 2. रूट बनाने और कार दौड़ाने का मुख्य फंक्शन
async function createRoute(startPlace, endPlace) {
    // अगर पुराना कोई एनीमेशन चल रहा है तो उसे रोकें और पुराना मैप साफ़ करें
    if (animationId) cancelAnimationFrame(animationId);
    if (startMarker) map.removeLayer(startMarker);
    if (endMarker) map.removeLayer(endMarker);
    if (routeLine) map.removeLayer(routeLine);
    if (carMarker) map.removeLayer(carMarker);

    // दोनों जगहों के नंबर्स पता करें
    const startCoords = await getCoordinates(startPlace);
    const endCoords = await getCoordinates(endPlace);

    if (!startCoords || !endCoords) {
        alert("माफ़ कीजिये, जगह का नाम नहीं मिल पाया! कृपया सही नाम डालें।");
        return;
    }

    // मैप पर नए मार्कर्स लगाएं
    startMarker = L.marker(startCoords).addTo(map).bindPopup(`<b>शुरुआत:</b> ${startPlace}`).openPopup();
    endMarker = L.marker(endCoords).addTo(map).bindPopup(`<b>मंज़िल:</b> ${endPlace}`);

    // दोनों के बीच नीली लाइन खींचें
    routeLine = L.polyline([startCoords, endCoords], {
        color: '#007bff',
        weight: 4,
        opacity: 0.7,
        dashArray: '5, 10'
    }).addTo(map);

    // कार का आइकॉन
    const carIcon = L.divIcon({
        html: '<div class="animated-car-icon">🚗</div>',
        iconSize: [30, 30],
        className: 'car-marker'
    });
    carMarker = L.marker(startCoords, { icon: carIcon }).addTo(map);

    // मैप को दोनों शहरों के हिसाब से ज़ूम करें
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

    // कार एनीमेशन लॉजिक
    let progress = 0;
    const speed = 0.005;

    function animateCar() {
        progress += speed;
        if (progress > 1) progress = 0;

        const lat = startCoords[0] + (endCoords[0] - startCoords[0]) * progress;
        const lng = startCoords[1] + (endCoords[1] - startCoords[1]) * progress;

        carMarker.setLatLng([lat, lng]);
        animationId = requestAnimationFrame(animateCar);
    }

    animateCar();
}

// 3. जब कोई यूजर आपकी वेबसाइट के सर्च बटन पर क्लिक करेगा
// (यह आपकी वेबसाइट के पहले से बने सर्च बटन को मैप से जोड़ देगा)
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const searchInput = document.getElementById('searchInput').value;
    
    if (searchInput.includes('to')) {
        const places = searchInput.split('to');
        const start = places[0].trim();
        const end = places[1].trim();
        createRoute(start, end);
    } else {
        createRoute("Delhi", searchInput.trim());
    }
});

function loginUser(email, password) {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log("लॉग इन सफल रहा!", user);
        alert("लॉग इन सफल रहा!");
    })
    .catch((error) => {
        const errorMessage = error.message;
        console.error("त्रुटि: " + errorMessage);
        alert("त्रुटि: " + errorMessage);
    });
}
