const RAZORPAY_KEY_ID = "rzp_live_TupFjCnbtrJtuy";
const MERCHANT_WHATSAPP = "918373960622";
const MERCHANT_EMAIL = "houseofsomaca@gmail.com";

let currentUser = null;

// View Navigation
function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active-view');
    });
    document.getElementById(viewId).classList.add('active-view');
    window.scrollTo(0, 0);

    if(viewId === 'checkout-view' && currentUser) {
        document.getElementById('cust-name').value = currentUser.name || '';
        document.getElementById('cust-email').value = currentUser.email || '';
        document.getElementById('cust-phone').value = currentUser.phone || '';
    }
}

// Authentication Tabs
function toggleAuth(type) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-section').forEach(s => s.style.display = 'none');

    if (type === 'signin') {
        document.querySelector('.auth-tab:nth-child(1)').classList.add('active');
        document.getElementById('signin-section').style.display = 'block';
    } else {
        document.querySelector('.auth-tab:nth-child(2)').classList.add('active');
        document.getElementById('signup-section').style.display = 'block';
    }
}

// LocalStorage Auth
function checkAuth() {
    const savedUser = localStorage.getItem('somaca_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI(true);
    }
}

function updateAuthUI(isLoggedIn) {
    const authBtn = document.getElementById('auth-btn');
    if(authBtn) {
        if(isLoggedIn) {
            authBtn.innerText = "My Account";
            authBtn.onclick = () => {
                populateProfileData();
                switchView('profile-view');
            };
        } else {
            authBtn.innerText = "Sign In";
            authBtn.onclick = () => switchView('auth-view');
        }
    }
}

function signUp() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();

    if(!name || !email || !phone || !pass) {
        showToast("Please fill all fields for registration.", "error");
        return;
    }

    let users = JSON.parse(localStorage.getItem('somaca_users') || '{}');
    if(users[email] || users[phone]) {
        showToast("Account already exists with this email or phone.", "error");
        return;
    }

    const newUser = { name, email, phone, password: pass, address: "", orders: [] };
    users[email] = newUser;
    users[phone] = newUser; // map both for easy login

    localStorage.setItem('somaca_users', JSON.stringify(users));
    localStorage.setItem('somaca_current_user', JSON.stringify(newUser));
    currentUser = newUser;

    updateAuthUI(true);
    showToast("Welcome to House of SOMACA!", "success");
    switchView('home-view');
}

function signIn() {
    const loginId = document.querySelector('#signin-section input[type="text"]').value.trim();
    const pass = document.querySelector('#signin-section input[type="password"]').value.trim();

    if(!loginId || !pass) {
        showToast("Please enter login credentials.", "error");
        return;
    }

    let users = JSON.parse(localStorage.getItem('somaca_users') || '{}');
    let user = users[loginId];

    if(user && user.password === pass) {
        localStorage.setItem('somaca_current_user', JSON.stringify(user));
        currentUser = user;
        updateAuthUI(true);
        showToast("Welcome back to SOMACA", "success");
        switchView('home-view');
    } else {
        showToast("Invalid credentials.", "error");
    }
}

// Particle Background Animation
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.01;
    }
    draw() {
        ctx.fillStyle = 'rgba(212, 175, 55, 0.5)'; // Gold particles
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    for (let i = 0; i < 100; i++) {
        particlesArray.push(new Particle());
    }
}
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();

        if (particlesArray[i].size <= 0.2) {
            particlesArray.splice(i, 1);
            i--;
            particlesArray.push(new Particle());
        }
    }
    requestAnimationFrame(animateParticles);
}

// Scroll Reveals
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


// Init
window.onload = () => {
    initParticles();
    animateParticles();
    checkAuth();
};

// ================= RAZORPAY CHECKOUT LOGIC =================
function initiateRazorpay() {
    const name = document.getElementById('cust-name').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const addr = document.getElementById('cust-addr').value.trim();

    if(!name || !email || !phone || !addr) {
        showToast("Please fill all mandatory delivery details.", "error");
        return;
    }

    if(phone.length < 10) {
        showToast("Please enter a valid 10-digit mobile number.", "error");
        return;
    }

    const cartTotal = 199;
    const itemsSummary = "1x SOMACA Botanical Facial Kit (50G)";

    var options = {
        "key": RAZORPAY_KEY_ID,
        "amount": cartTotal * 100,
        "currency": "INR",
        "name": "House of SOMACA",
        "description": "Order Confirmation - Luxury Skincare",
        "image": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=200&q=80",
        "handler": function (response){
            handleSuccessfulPayment(response.razorpay_payment_id, name, email, phone, addr, cartTotal, itemsSummary);
        },
        "prefill": {
            "name": name,
            "email": email,
            "contact": "+91" + phone.replace('+91','').replace(/\s/g,'')
        },
        "notes": {
            "customer_name": name,
            "phone": phone,
            "email": email,
            "shipping_address": addr,
            "ordered_items": itemsSummary,
            "official_support_email": MERCHANT_EMAIL
        },
        "theme": {
            "color": "#D4AF37"
        },
        "modal": {
            "ondismiss": function(){
                showToast("Payment was not completed. Your order has not been placed.", "error");
            }
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', function (response){
        showToast("Payment failed. Please try again.", "error");
    });
    rzp1.open();
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✨' : '⚠️';
    toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        if (container.contains(toast)) {
            container.removeChild(toast);
        }
    }, 3000);
}

// ================= POST-PAYMENT / CONFIRMATION LOGIC =================
let currentOrder = null;

function handleSuccessfulPayment(paymentId, name, email, phone, addr, total, items) {
    const timestamp = new Date().getTime();
    const orderId = "#SMC-" + Math.floor(10000 + Math.random() * 90000);

    // Delivery estimated 5-7 days from now
    const estDate = new Date(timestamp + (5 * 24 * 60 * 60 * 1000));
    const estDeliveryStr = estDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    currentOrder = {
        orderId,
        timestamp,
        date: new Date(timestamp).toLocaleString(),
        estimatedDelivery: estDeliveryStr,
        items,
        total,
        address: addr,
        phone,
        email,
        razorpay_payment_id: paymentId,
        awbNumber: "Pending Dispatch",
        courierName: "SOMACA Express / Partner Courier"
    };

    // Save to global orders
    let allOrders = JSON.parse(localStorage.getItem('somaca_orders') || '[]');
    allOrders.push(currentOrder);
    localStorage.setItem('somaca_orders', JSON.stringify(allOrders));

    // Save to user profile if logged in
    if(currentUser) {
        let users = JSON.parse(localStorage.getItem('somaca_users') || '{}');
        let user = users[currentUser.email] || users[currentUser.phone];
        if(user) {
            user.orders = user.orders || [];
            user.orders.push(currentOrder);
            localStorage.setItem('somaca_users', JSON.stringify(users));
            // Update current user
            currentUser = user;
            localStorage.setItem('somaca_current_user', JSON.stringify(currentUser));
        }
    }

    // Reset Cart (dummy update)
    document.getElementById('cart-count').innerText = "0";

    // Update Confirmation View
    document.getElementById('confirm-order-id').innerText = orderId;
    document.getElementById('confirm-est-delivery').innerText = "Est. Delivery: " + estDeliveryStr;

    // Setup WhatsApp Button
    const waMsg = `Hello House of SOMACA,%0A%0AI have placed an order.%0A*Order ID:* ${orderId}%0A*Amount:* ₹${total}%0A*Items:* ${items}%0A*Payment ID:* ${paymentId}`;
    document.getElementById('wa-confirm-btn').onclick = () => {
        window.open(`https://wa.me/${MERCHANT_WHATSAPP}?text=${waMsg}`, '_blank');
    };

    switchView('confirmation-view');
}

function printInvoice() {
    if(!currentOrder) {
        showToast("No active order to print.", "error");
        return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Invoice ${currentOrder.orderId}</title>
            <style>
                body { font-family: 'Cormorant Garamond', serif; padding: 40px; color: #333; }
                h1 { color: #D4AF37; text-align: center; font-size: 36px; letter-spacing: 4px; }
                .header, .footer { text-align: center; font-family: 'Montserrat', sans-serif; font-size: 12px; color: #666; margin-bottom: 30px; }
                .details { margin: 40px 0; font-family: 'Montserrat', sans-serif; font-size: 14px; line-height: 1.8; }
                .total { font-size: 20px; font-weight: bold; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px;}
            </style>
        </head>
        <body>
            <div class="header">
                <b>HOUSE OF SOMACA</b><br>
                Official Royal Invoice<br>
                Support: ${MERCHANT_EMAIL} | +91 8373960622
            </div>
            <h1>INVOICE</h1>
            <div class="details">
                <b>Order ID:</b> ${currentOrder.orderId}<br>
                <b>Date:</b> ${currentOrder.date}<br>
                <b>Payment ID:</b> ${currentOrder.razorpay_payment_id}<br>
                <br>
                <b>Billed To:</b><br>
                ${currentOrder.email}<br>
                ${currentOrder.phone}<br>
                ${currentOrder.address}<br>
                <br>
                <b>Items Ordered:</b><br>
                ${currentOrder.items}<br>
            </div>
            <div class="total">Total Paid: ₹${currentOrder.total}</div>
            <div class="footer" style="margin-top: 50px;">
                Thank you for choosing uncompromised purity.<br>
                © 2026 SOMACA Botanicals
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
}

// ================= LIVE ORDER TRACKING LOGIC =================

function searchOrder() {
    const input = document.getElementById('track-search-input').value.trim();
    if(!input) {
        showToast("Please enter an Order ID or Mobile Number.", "error");
        return;
    }

    let allOrders = JSON.parse(localStorage.getItem('somaca_orders') || '[]');
    let foundOrder = allOrders.find(o => o.orderId === input || o.phone === input);

    if(!foundOrder) {
        showToast("No order found with the provided details.", "error");
        document.getElementById('tracking-result').style.display = 'none';
        return;
    }

    renderTracking(foundOrder);
}

function renderTracking(order) {
    document.getElementById('tracking-result').style.display = 'block';
    document.getElementById('track-order-id').innerText = order.orderId;
    document.getElementById('track-est-del').innerText = order.estimatedDelivery;

    document.getElementById('courier-name').innerText = order.courierName;
    document.getElementById('courier-awb').value = `AWB: ${order.awbNumber}`;

    const waMsg = `Hi House of SOMACA, please share the live courier tracking link for my Order ID: ${order.orderId}`;
    document.getElementById('wa-track-btn').onclick = () => {
        window.open(`https://wa.me/${MERCHANT_WHATSAPP}?text=${encodeURIComponent(waMsg)}`, '_blank');
    };

    const container = document.getElementById('tracking-timeline-container');
    container.innerHTML = '';

    const stages = [
        { title: "Order Confirmed & Payment Verified", delayHr: 0, timeStr: `${order.date} | ID: ${order.razorpay_payment_id}` },
        { title: "Luxury Formulation & Quality Packaging", delayHr: 2 },
        { title: "Dispatched from SOMACA Atelier", delayHr: 24 },
        { title: "In Transit to Destination City", delayHr: 48 },
        { title: "Out for Delivery / Delivered", delayHr: 120, est: order.estimatedDelivery } // roughly 5 days
    ];

    const now = new Date().getTime();
    const orderTime = order.timestamp;

    stages.forEach((stage, index) => {
        const stageTime = orderTime + (stage.delayHr * 60 * 60 * 1000);
        const isActive = now >= stageTime;

        let timeHtml = "";
        if (stage.timeStr) {
            timeHtml = `<div class="timeline-time">${stage.timeStr}</div>`;
        } else if (isActive && index < 4) {
            timeHtml = `<div class="timeline-time">${new Date(stageTime).toLocaleString()}</div>`;
        } else if (index === 4) {
            timeHtml = `<div class="timeline-time">Expected: ${stage.est}</div>`;
        }

        const div = document.createElement('div');
        div.className = `timeline-stage ${isActive ? 'active' : ''}`;
        div.innerHTML = `
            <div class="timeline-title">${stage.title}</div>
            ${timeHtml}
        `;
        container.appendChild(div);
    });
}

// ================= VIP PROFILE LOGIC =================
function switchProfileTab(tabId) {
    document.querySelectorAll('#profile-view .auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#profile-view .profile-tab-content').forEach(s => s.style.display = 'none');

    if (tabId === 'profile-tab') {
        document.querySelector('#profile-view .auth-tab:nth-child(1)').classList.add('active');
        document.getElementById('profile-tab').style.display = 'block';
    } else if (tabId === 'orders-tab') {
        document.querySelector('#profile-view .auth-tab:nth-child(2)').classList.add('active');
        document.getElementById('orders-tab').style.display = 'block';
    } else {
        document.querySelector('#profile-view .auth-tab:nth-child(3)').classList.add('active');
        document.getElementById('help-tab').style.display = 'block';
    }
}

function populateProfileData() {
    if(!currentUser) return;
    
    let users = JSON.parse(localStorage.getItem('somaca_users') || '{}');
    let user = users[currentUser.email] || users[currentUser.phone] || currentUser;

    document.getElementById('prof-name').value = user.name || '';
    document.getElementById('prof-email').value = user.email || '';
    document.getElementById('prof-phone').value = user.phone || '';
    document.getElementById('prof-address').value = user.address || '';

    const ordersList = document.getElementById('profile-orders-list');
    if(!user.orders || user.orders.length === 0) {
        ordersList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No previous orders found.</p>';
    } else {
        let html = '';
        user.orders.forEach(o => {
            html += `
                <div class="order-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="color: #fff; font-family: monospace; font-size: 14px;">${o.orderId}</span>
                        <span style="color: var(--gold); font-size: 12px; font-weight: bold;">₹${o.total}</span>
                    </div>
                    <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 10px;">Placed on: ${o.date}</div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn-main" style="flex: 1; padding: 6px; font-size: 11px; background: transparent; border: 1px solid var(--gold); color: var(--gold);" onclick="viewOrderTracking('${o.orderId}')">Track Order</button>
                        <button class="btn-main" style="flex: 1; padding: 6px; font-size: 11px; background: transparent; border: 1px solid var(--gold); color: var(--gold);" onclick="printHistoricalInvoice('${o.orderId}')">Invoice</button>
                    </div>
                </div>
            `;
        });
        ordersList.innerHTML = html;
    }
}

function viewOrderTracking(orderId) {
    switchView('tracking-view');
    document.getElementById('track-search-input').value = orderId;
    searchOrder();
}

function saveProfile() {
    if(!currentUser) return;

    const name = document.getElementById('prof-name').value.trim();
    const phone = document.getElementById('prof-phone').value.trim();
    const address = document.getElementById('prof-address').value.trim();

    if(!name || !phone) {
        showToast("Name and phone number are required.", "error");
        return;
    }

    let users = JSON.parse(localStorage.getItem('somaca_users') || '{}');
    let user = users[currentUser.email] || users[currentUser.phone] || currentUser;

    user.name = name;
    user.phone = phone;
    user.address = address;

    users[currentUser.email] = user;
    if(currentUser.phone && currentUser.phone !== phone) {
       delete users[currentUser.phone];
    }
    users[phone] = user;

    localStorage.setItem('somaca_users', JSON.stringify(users));

    currentUser = user;
    localStorage.setItem('somaca_current_user', JSON.stringify(currentUser));

    showToast("Profile details saved successfully.", "success");
}

function logOut() {
    currentUser = null;
    localStorage.removeItem('somaca_current_user');
    updateAuthUI(false);
    switchView('home-view');
    showToast("You have been signed out.", "success");
}

// ================= SOCIAL LOGIN LOGIC =================
function openSocialModal() {
    document.getElementById('social-modal').style.display = 'flex';
}

function closeSocialModal() {
    document.getElementById('social-modal').style.display = 'none';
}

function submitSocialLogin() {
    const name = document.getElementById('social-name').value.trim();
    const email = document.getElementById('social-email').value.trim();
    const phone = document.getElementById('social-phone').value.trim();

    if(!name || !email || !phone) {
        showToast("Please fill all details to continue.", "error");
        return;
    }

    let users = JSON.parse(localStorage.getItem('somaca_users') || '{}');
    let user = users[email] || users[phone];

    if(!user) {
        user = { name, email, phone, password: "social_login", address: "", orders: [] };
        users[email] = user;
        users[phone] = user;
        localStorage.setItem('somaca_users', JSON.stringify(users));
    }

    localStorage.setItem('somaca_current_user', JSON.stringify(user));
    currentUser = user;

    closeSocialModal();
    updateAuthUI(true);
    showToast(`Welcome via Social Login, ${name}!`, "success");
    switchView('home-view');
}

// Add event listeners for social buttons
document.querySelectorAll('.oauth-btn').forEach(btn => {
    btn.onclick = (e) => {
        e.preventDefault();
        openSocialModal();
    };
});


function printHistoricalInvoice(orderId) {
    let allOrders = JSON.parse(localStorage.getItem('somaca_orders') || '[]');
    let foundOrder = allOrders.find(o => o.orderId === orderId);
    if(foundOrder) {
        let tempCurrent = currentOrder;
        currentOrder = foundOrder;
        printInvoice();
        currentOrder = tempCurrent;
    } else {
        showToast("Invoice not found.", "error");
    }
}
