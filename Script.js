const RAZORPAY_KEY_ID = "rzp_live_TupFjCnbtrJtuy";
const MERCHANT_WHATSAPP = "918373960622";
const MERCHANT_EMAIL = "houseofsomaca@gmail.com";

let currentUser = null;
let currentStaff = null;
let pendingOTP = null;
let pendingAuthData = null;

// Registry for Staff/Employees
const EMPLOYEE_REGISTRY = {
    "SOM-101": { name: "Aditi Sharma", email: "aditi@somaca.com" },
    "SOM-102": { name: "Rohan Verma", email: "rohan@somaca.com" },
    "SOM-103": { name: "Founder / Admin", email: "houseofsomaca@gmail.com" }
};

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

// Authentication Tabs (Client)
function toggleAuth(type) {
    document.querySelectorAll('#auth-view .auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#auth-view .auth-section').forEach(s => s.style.display = 'none');

    if (type === 'signin') {
        document.querySelector('#auth-view .auth-tab:nth-child(1)').classList.add('active');
        document.getElementById('signin-section').style.display = 'block';
    } else {
        document.querySelector('#auth-view .auth-tab:nth-child(2)').classList.add('active');
        document.getElementById('signup-section').style.display = 'block';
    }
}

// Authentication Tabs (Staff)
function toggleStaffAuth(type) {
    document.querySelectorAll('#staff-auth-view .auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#staff-auth-view .auth-section').forEach(s => s.style.display = 'none');

    if (type === 'signin') {
        document.querySelector('#staff-auth-view .auth-tab:nth-child(1)').classList.add('active');
        document.getElementById('staff-signin-section').style.display = 'block';
    } else {
        document.querySelector('#staff-auth-view .auth-tab:nth-child(2)').classList.add('active');
        document.getElementById('staff-register-section').style.display = 'block';
    }
}

// LocalStorage Auth
function checkAuth() {
    const savedUser = localStorage.getItem('somaca_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI(true);
    }

    const savedStaff = localStorage.getItem('somaca_current_staff');
    if(savedStaff) {
        currentStaff = JSON.parse(savedStaff);
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

// ================= CLIENT OTP AUTHENTICATION =================
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function requestClientOTP(action) {
    let emailOrPhone, name, email, phone;

    if (action === 'signin') {
        emailOrPhone = document.getElementById('login-identifier').value.trim();
        if(!emailOrPhone) {
            showToast("Please enter Mobile Number or Email.", "error");
            return;
        }

        let users = JSON.parse(localStorage.getItem('somaca_users') || '{}');
        let user = users[emailOrPhone];

        if(!user) {
            showToast("Account not found. Please Sign Up.", "error");
            return;
        }

        pendingAuthData = { type: 'signin', user: user };

    } else if (action === 'signup') {
        name = document.getElementById('reg-name').value.trim();
        email = document.getElementById('reg-email').value.trim();
        phone = document.getElementById('reg-phone').value.trim();

        if(!name || !email || !phone) {
            showToast("Please fill all details.", "error");
            return;
        }

        let users = JSON.parse(localStorage.getItem('somaca_users') || '{}');
        if(users[email] || users[phone]) {
            showToast("Account already exists. Please Sign In.", "error");
            return;
        }

        pendingAuthData = { type: 'signup', data: { name, email, phone, address: "", orders: [] } };
    }

    pendingOTP = generateOTP();
    // Simulate sending OTP
    showToast(`OTP Sent! Your verification code is ${pendingOTP}`, "success");

    // Show Modal
    document.getElementById('otp-input').value = "";
    document.getElementById('otp-modal').style.display = 'flex';
}

function closeOTPModal() {
    document.getElementById('otp-modal').style.display = 'none';
    pendingOTP = null;
    pendingAuthData = null;
}

function verifyClientOTP() {
    const inputOTP = document.getElementById('otp-input').value.trim();
    if(inputOTP !== pendingOTP) {
        showToast("Invalid OTP. Please try again.", "error");
        return;
    }

    // Success
    closeOTPModal();
    let users = JSON.parse(localStorage.getItem('somaca_users') || '{}');

    if(pendingAuthData.type === 'signup') {
        const newUser = pendingAuthData.data;
        users[newUser.email] = newUser;
        users[newUser.phone] = newUser;
        localStorage.setItem('somaca_users', JSON.stringify(users));
        localStorage.setItem('somaca_current_user', JSON.stringify(newUser));
        currentUser = newUser;
        showToast("Welcome to House of SOMACA!", "success");
    } else {
        const user = pendingAuthData.user;
        localStorage.setItem('somaca_current_user', JSON.stringify(user));
        currentUser = user;
        showToast("Welcome back to SOMACA", "success");
    }

    updateAuthUI(true);
    switchView('home-view');
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
        name,
        address: addr,
        phone,
        email,
        razorpay_payment_id: paymentId,
        awbNumber: "Pending Dispatch",
        status: "Confirmed",
        courierName: "SOMACA Express"
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

    const statusMap = {
        "Confirmed": 0,
        "Processing": 1,
        "Dispatched": 2,
        "In Transit": 3,
        "Delivered": 4
    };

    const currentStatusIndex = statusMap[order.status] || 0;

    const stages = [
        { title: "Order Confirmed & Payment Verified", timeStr: `${order.date} | ID: ${order.razorpay_payment_id}` },
        { title: "Luxury Formulation & Quality Packaging" },
        { title: "Dispatched from SOMACA Atelier" },
        { title: "In Transit to Destination City" },
        { title: "Out for Delivery / Delivered", est: order.estimatedDelivery }
    ];

    stages.forEach((stage, index) => {
        const isActive = index <= currentStatusIndex;

        let timeHtml = "";
        if (stage.timeStr) {
            timeHtml = `<div class="timeline-time">${stage.timeStr}</div>`;
        } else if (index === 4) {
            timeHtml = `<div class="timeline-time">Expected: ${stage.est}</div>`;
        } else if (isActive) {
            timeHtml = `<div class="timeline-time">Completed</div>`;
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

    // Refresh user's orders from global store to get updated statuses from staff
    let allOrders = JSON.parse(localStorage.getItem('somaca_orders') || '[]');
    let userOrders = allOrders.filter(o => o.email === user.email || o.phone === user.phone);

    if(userOrders.length === 0) {
        ordersList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No previous orders found.</p>';
    } else {
        let html = '';
        userOrders.forEach(o => {
            html += `
                <div class="order-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="color: #fff; font-family: monospace; font-size: 14px;">${o.orderId}</span>
                        <span style="color: var(--gold); font-size: 12px; font-weight: bold;">₹${o.total}</span>
                    </div>
                    <div style="color: var(--text-muted); font-size: 12px; margin-bottom: 5px;">Placed on: ${o.date}</div>
                    <div style="color: var(--pink-accent); font-size: 11px; font-weight: 600;">Status: ${o.status || 'Confirmed'}</div>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button class="btn-main" style="flex: 1; padding: 6px; font-size: 11px; background: transparent; border: 1px solid var(--gold); color: var(--gold);" onclick="viewOrderTracking('${o.orderId}')">Track Order</button>
                        <button class="btn-main" style="flex: 1; padding: 6px; font-size: 11px; background: transparent; border: 1px solid var(--gold); color: var(--gold);" onclick="printHistoricalInvoice('${o.orderId}')">Invoice</button>
                    </div>
                </div>
            `;
        });
        ordersList.innerHTML = html;

        // sync back to user object
        user.orders = userOrders;
        users[user.email] = user;
        users[user.phone] = user;
        localStorage.setItem('somaca_users', JSON.stringify(users));
    }
}

function viewOrderTracking(orderId) {
    switchView('tracking-view');
    document.getElementById('track-search-input').value = orderId;
    searchOrder();
}


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

// ================= STAFF / EMPLOYEE PORTAL =================

function staffRegister() {
    const empId = document.getElementById('staff-reg-id').value.trim();
    const email = document.getElementById('staff-reg-email').value.trim();
    const pass = document.getElementById('staff-reg-pass').value.trim();

    if(!empId || !email || !pass) {
        showToast("Please fill all staff details.", "error");
        return;
    }

    const validEmployee = EMPLOYEE_REGISTRY[empId];

    if(!validEmployee || validEmployee.email !== email) {
        showToast("Verification Failed: Employee ID and Email do not match the company registry.", "error");
        return;
    }

    let staffMembers = JSON.parse(localStorage.getItem('somaca_staff') || '{}');

    if(staffMembers[empId]) {
        showToast("Staff member already registered. Please sign in.", "error");
        return;
    }

    const newStaff = { empId, name: validEmployee.name, email, password: pass };
    staffMembers[empId] = newStaff;
    localStorage.setItem('somaca_staff', JSON.stringify(staffMembers));

    showToast("Staff registered successfully. Please login.", "success");
    toggleStaffAuth('signin');
}

function staffSignIn() {
    const empId = document.getElementById('staff-login-id').value.trim();
    const pass = document.getElementById('staff-login-pass').value.trim();

    if(!empId || !pass) {
        showToast("Please enter Employee ID and password.", "error");
        return;
    }

    let staffMembers = JSON.parse(localStorage.getItem('somaca_staff') || '{}');
    let staff = staffMembers[empId];

    if(staff && staff.password === pass) {
        localStorage.setItem('somaca_current_staff', JSON.stringify(staff));
        currentStaff = staff;
        showToast(`Welcome to the Atelier, ${staff.name}`, "success");
        openStaffDashboard();
    } else {
        showToast("Invalid staff credentials or not registered.", "error");
    }
}

function staffLogOut() {
    currentStaff = null;
    localStorage.removeItem('somaca_current_staff');
    switchView('home-view');
    showToast("Staff logged out successfully.", "success");
}

function openStaffDashboard() {
    if(!currentStaff) {
        switchView('staff-auth-view');
        return;
    }
    document.getElementById('staff-welcome-msg').innerText = `Welcome, ${currentStaff.name} (${currentStaff.empId})`;
    switchView('staff-dashboard-view');
    renderStaffOrders();
}

function renderStaffOrders(filterText = '') {
    const tbody = document.getElementById('staff-orders-body');
    let allOrders = JSON.parse(localStorage.getItem('somaca_orders') || '[]');

    // Reverse to show newest first
    allOrders.reverse();

    if(filterText) {
        filterText = filterText.toLowerCase();
        allOrders = allOrders.filter(o =>
            o.orderId.toLowerCase().includes(filterText) ||
            (o.name && o.name.toLowerCase().includes(filterText)) ||
            (o.phone && o.phone.includes(filterText))
        );
    }

    if(allOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--text-muted);">No orders found.</td></tr>';
        return;
    }

    let html = '';
    allOrders.forEach(o => {
        const currentStatus = o.status || 'Confirmed';
        html += `
            <tr class="staff-order-row">
                <td>
                    <div style="font-family: monospace; color: #fff;">${o.orderId}</div>
                    <div style="color: var(--text-muted); font-size: 11px;">${o.date}</div>
                </td>
                <td>
                    <div style="color: #fff;">${o.name || 'N/A'}</div>
                    <div style="color: var(--text-muted); font-size: 11px;">${o.phone} | ${o.email}</div>
                    <div style="color: var(--text-muted); font-size: 10px; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${o.address}">${o.address}</div>
                </td>
                <td>
                    <select class="glass-input" style="padding: 4px; font-size: 11px; margin-bottom: 5px; width: 100%;" onchange="updateOrderStatus('${o.orderId}', this.value)">
                        <option value="Confirmed" ${currentStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Processing" ${currentStatus === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Dispatched" ${currentStatus === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
                        <option value="In Transit" ${currentStatus === 'In Transit' ? 'selected' : ''}>In Transit</option>
                        <option value="Delivered" ${currentStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                    <input type="text" class="glass-input" style="padding: 4px; font-size: 11px; width: 100%;" placeholder="Enter AWB" value="${o.awbNumber === 'Pending Dispatch' ? '' : o.awbNumber}" onblur="updateOrderAWB('${o.orderId}', this.value)">
                </td>
                <td>
                    <div style="color: var(--gold); font-weight: bold; margin-bottom: 5px;">₹${o.total}</div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function filterStaffOrders() {
    const input = document.getElementById('staff-search-input').value;
    renderStaffOrders(input);
}

function updateOrderStatus(orderId, newStatus) {
    let allOrders = JSON.parse(localStorage.getItem('somaca_orders') || '[]');
    let orderIndex = allOrders.findIndex(o => o.orderId === orderId);
    if(orderIndex > -1) {
        allOrders[orderIndex].status = newStatus;
        localStorage.setItem('somaca_orders', JSON.stringify(allOrders));
        showToast(`Status updated to ${newStatus} for ${orderId}`, "success");
    }
}

function updateOrderAWB(orderId, newAWB) {
    if(!newAWB) return;
    let allOrders = JSON.parse(localStorage.getItem('somaca_orders') || '[]');
    let orderIndex = allOrders.findIndex(o => o.orderId === orderId);
    if(orderIndex > -1 && allOrders[orderIndex].awbNumber !== newAWB) {
        allOrders[orderIndex].awbNumber = newAWB;
        localStorage.setItem('somaca_orders', JSON.stringify(allOrders));
        showToast(`AWB updated for ${orderId}`, "success");
    }
}
