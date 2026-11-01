
// ================= FIREBASE INITIALIZATION =================
const firebaseConfig = {
  apiKey: "AIzaSyDlXERn2wmUCruVzJC9hCFl2nm9UFRKAfU",
  authDomain: "houseofsomaca7.firebaseapp.com",
  projectId: "houseofsomaca7",
  storageBucket: "houseofsomaca7.firebasestorage.app",
  messagingSenderId: "311541663916",
  appId: "1:311541663916:web:df1a74884852bddf85f709",
  measurementId: "G-6509VW49YJ"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Role config
const FOUNDER_EMAIL = "houseofsomaca@gmail.com";
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
    "SMC-976745@S": { name: "Founder / Admin", email: "houseofsomaca@gmail.com" }
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


// Firebase Auth Listener
function checkAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || 'Client',
                phone: user.phoneNumber || ''
            };

            // Check if staff
            db.collection('staff_registry').where('email', '==', user.email).get().then(snap => {
                if(!snap.empty) {
                    currentStaff = snap.docs[0].data();
                    currentStaff.empId = snap.docs[0].id;
                }
                updateAuthUI(true);
            });

            // Sync user to firestore
            db.collection('users').doc(user.uid).set({
                email: user.email,
                name: user.displayName || 'Client',
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, {merge: true});

        } else {
            currentUser = null;
            currentStaff = null;
            updateAuthUI(false);
        }
    });
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


// ================= UTILS =================
function sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// ================= GUCCI UI LOGIC =================
function toggleDrawer(drawerId) {
    const drawer = document.getElementById(drawerId);
    if(drawer.classList.contains('open')) {
        drawer.classList.remove('open');
    } else {
        // close all other drawers first
        document.querySelectorAll('.drawer').forEach(d => d.classList.remove('open'));
        drawer.classList.add('open');
        if(drawerId === 'search-drawer') {
            setTimeout(() => document.querySelector('.search-input').focus(), 300);
        }
    }
}

function openUserMenu() {
    if(currentUser) {
        populateProfileData();
        switchView('profile-view');
    } else {
        switchView('auth-view');
    }
}

function addToWaitlist(categoryName) {
    showToast(`Added to exclusive VIP waitlist for ${categoryName}.`, "success");
}



// ================= SCROLL REVEAL LOGIC =================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Trigger reveal on load for elements already in viewport
setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if(rect.top < window.innerHeight) {
            el.classList.add('active');
            observer.unobserve(el);
        }
    });
}, 100);

// Init
window.onload = () => {
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


    // Save to Firestore
    db.collection('orders').doc(orderId).set(currentOrder)
    .then(() => {
        console.log("Order saved to Firestore");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });

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
                ${sanitize(currentOrder.email)}<br>
                ${sanitize(currentOrder.phone)}<br>
                ${sanitize(currentOrder.address)}<br>
                <br>
                <b>Items Ordered:</b><br>
                ${sanitize(currentOrder.items)}<br>
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
        showToast("Please enter an Order ID.", "error");
        return;
    }

    db.collection('orders').doc(input).get().then(doc => {
        if(!doc.exists) {
            showToast("No order found with the provided ID.", "error");
            document.getElementById('tracking-result').style.display = 'none';
        } else {
            renderTracking(doc.data());
        }
    });
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

    document.getElementById('prof-name').value = currentUser.name || '';
    document.getElementById('prof-email').value = currentUser.email || '';
    document.getElementById('prof-phone').value = currentUser.phone || '';

    db.collection('users').doc(currentUser.uid).get().then(doc => {
        if(doc.exists) {
            document.getElementById('prof-address').value = doc.data().address || '';
        }
    });

    const ordersList = document.getElementById('profile-orders-list');

    db.collection('orders').where('email', '==', currentUser.email).get().then(snap => {
        if(snap.empty) {
            ordersList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No previous orders found.</p>';
            return;
        }

        let html = '';
        snap.forEach(doc => {
            const o = doc.data();
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
    });
}

function viewOrderTracking(orderId) {
    switchView('tracking-view');
    document.getElementById('track-search-input').value = orderId;
    searchOrder();
}



function printHistoricalInvoice(orderId) {
    db.collection('orders').doc(orderId).get().then(doc => {
        if(doc.exists) {
            let tempCurrent = currentOrder;
            currentOrder = doc.data();
            printInvoice();
            currentOrder = tempCurrent;
        } else {
            showToast("Invoice not found.", "error");
        }
    });
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

    db.collection('users').doc(currentUser.uid).update({
        name: name,
        phone: phone,
        address: address
    }).then(() => {
        showToast("Profile details saved successfully.", "success");
    }).catch(e => showToast(e.message, "error"));
}


function logOut() {
    auth.signOut().then(() => {
        switchView('home-view');
        showToast("You have been signed out.", "success");
    });
}

// ================= FIREBASE AUTH LOGIC =================
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        showToast(`Welcome back, ${result.user.displayName}!`, "success");
        switchView('home-view');
    }).catch((error) => {
        showToast(error.message, "error");
    });
}

function sendMagicLink() {
    const email = document.getElementById('magic-email-input').value.trim();
    if(!email) {
        showToast("Please enter a valid email address.", "error");
        return;
    }

    const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true
    };

    auth.sendSignInLinkToEmail(email, actionCodeSettings)
        .then(() => {
            window.localStorage.setItem('emailForSignIn', email);
            showToast("Magic link sent! Check your inbox.", "success");
        })
        .catch((error) => {
            showToast(error.message, "error");
        });
}

function completeMagicLinkSignIn() {
    const email = document.getElementById('confirm-email-input').value.trim();
    if(!email) {
        showToast("Email is required.", "error");
        return;
    }

    auth.signInWithEmailLink(email, window.location.href)
        .then((result) => {
            window.localStorage.removeItem('emailForSignIn');
            document.getElementById('email-confirm-modal').style.display = 'none';
            showToast("Successfully signed in!", "success");
            switchView('home-view');
        })
        .catch((error) => {
            showToast(error.message, "error");
        });
}

// Check for magic link on load
if (auth.isSignInWithEmailLink(window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
        document.getElementById('email-confirm-modal').style.display = 'flex';
    } else {
        auth.signInWithEmailLink(email, window.location.href)
            .then((result) => {
                window.localStorage.removeItem('emailForSignIn');
                showToast("Successfully signed in!", "success");
            })
            .catch((error) => {
                showToast(error.message, "error");
            });
    }
}



// ================= STAFF / EMPLOYEE PORTAL =================

function staffRegister() {
    const empId = document.getElementById('staff-reg-id').value.trim();
    const email = document.getElementById('staff-reg-email').value.trim();
    const pass = document.getElementById('staff-reg-pass').value.trim();

    if(!empId || !email || !pass) {
        showToast("Please fill all staff details.", "error");
        return;
    }

    // Verify against registry in Firestore
    db.collection('staff_registry').doc(empId).get().then((doc) => {
        if (doc.exists && doc.data().email === email) {
            auth.createUserWithEmailAndPassword(email, pass)
                .then((userCredential) => {
                    showToast("Staff registered successfully. Please login.", "success");
                    toggleStaffAuth('signin');
                })
                .catch((error) => {
                    showToast(error.message, "error");
                });
        } else {
            showToast("Verification Failed: Employee ID and Email do not match registry.", "error");
        }
    }).catch((error) => {
        showToast("Error checking registry: " + error.message, "error");
    });
}

function staffSignIn() {
    const empId = document.getElementById('staff-login-id').value.trim();
    const pass = document.getElementById('staff-login-pass').value.trim();

    if(!empId || !pass) {
        showToast("Please enter Employee ID and password.", "error");
        return;
    }

    db.collection('staff_registry').doc(empId).get().then((doc) => {
        if(doc.exists) {
            const email = doc.data().email;
            auth.signInWithEmailAndPassword(email, pass)
                .then((userCredential) => {
                    currentStaff = doc.data();
                    currentStaff.empId = empId;
                    showToast(`Welcome to the Atelier, ${currentStaff.name}`, "success");
                    openStaffDashboard();
                })
                .catch((error) => {
                    showToast("Invalid password.", "error");
                });
        } else {
            showToast("Invalid staff credentials or not registered.", "error");
        }
    });
}

function staffLogOut() {
    auth.signOut().then(() => {
        switchView('home-view');
        showToast("Staff logged out successfully.", "success");
    });
}

function switchStaffTab(tabId) {
    document.querySelectorAll('#staff-dashboard-view .auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#staff-dashboard-view .profile-tab-content').forEach(s => s.style.display = 'none');

    if (tabId === 'staff-orders-tab') {
        document.querySelector('#staff-dashboard-view .auth-tab:nth-child(1)').classList.add('active');
        document.getElementById('staff-orders-tab').style.display = 'block';
    } else if (tabId === 'staff-hr-tab') {
        document.querySelector('#staff-dashboard-view .auth-tab:nth-child(2)').classList.add('active');
        document.getElementById('staff-hr-tab').style.display = 'block';
        loadHRMetrics();
    } else if (tabId === 'staff-profile-tab') {
        document.querySelector('#staff-dashboard-view .auth-tab:nth-child(3)').classList.add('active');
        document.getElementById('staff-profile-tab').style.display = 'block';
    }
}

let staffUnsubscribe = null;

function openStaffDashboard() {
    if(!currentStaff) {
        switchView('staff-auth-view');
        return;
    }
    document.getElementById('staff-welcome-msg').innerText = `Welcome, ${currentStaff.name} (${currentStaff.empId})`;
    switchView('staff-dashboard-view');

    // RBAC
    if(currentStaff.email === FOUNDER_EMAIL || currentStaff.empId === "SMC-976745@S") {
        document.getElementById('hr-metrics-tab-btn').style.display = 'inline-block';
    } else {
        document.getElementById('hr-metrics-tab-btn').style.display = 'none';
        switchStaffTab('staff-orders-tab');
    }

    // Realtime Orders
    if(staffUnsubscribe) staffUnsubscribe();
    staffUnsubscribe = db.collection('orders').orderBy('timestamp', 'desc').onSnapshot((snapshot) => {
        let allOrders = [];
        snapshot.forEach(doc => {
            allOrders.push(doc.data());
        });
        window.staffAllOrders = allOrders; // cache for filter
        renderStaffOrders(allOrders);
    });
}

function renderStaffOrders(orders) {
    const tbody = document.getElementById('staff-orders-body');
    if(!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--text-muted);">No orders found.</td></tr>';
        return;
    }

    let html = '';
    orders.forEach(o => {
        const currentStatus = o.status || 'Confirmed';
        html += `
            <tr class="staff-order-row">
                <td>
                    <div style="font-family: monospace; color: #fff;">${o.orderId}</div>
                    <div style="color: var(--text-muted); font-size: 11px;">${o.date}</div>
                </td>
                <td>
                    <div style="color: #fff;">${sanitize(o.name) || 'N/A'}</div>
                    <div style="color: var(--text-muted); font-size: 11px;">${sanitize(o.phone)} | ${sanitize(o.email)}</div>
                    <div style="color: var(--text-muted); font-size: 10px; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${sanitize(o.address)}">${sanitize(o.address)}</div>
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
    const input = document.getElementById('staff-search-input').value.toLowerCase();
    const orders = window.staffAllOrders || [];

    if(!input) {
        renderStaffOrders(orders);
        return;
    }

    const filtered = orders.filter(o =>
        o.orderId.toLowerCase().includes(input) ||
        (o.name && o.name.toLowerCase().includes(input)) ||
        (o.phone && o.phone.includes(input))
    );
    renderStaffOrders(filtered);
}

function updateOrderStatus(orderId, newStatus) {
    db.collection('orders').doc(orderId).update({ status: newStatus })
        .then(() => showToast(`Status updated to ${newStatus}`, "success"))
        .catch(e => showToast(e.message, "error"));
}

function updateOrderAWB(orderId, newAWB) {
    if(!newAWB) return;
    db.collection('orders').doc(orderId).update({ awbNumber: newAWB })
        .then(() => showToast(`AWB updated`, "success"))
        .catch(e => showToast(e.message, "error"));
}

function loadHRMetrics() {
    const orders = window.staffAllOrders || [];
    let totalRevenue = 0;
    orders.forEach(o => totalRevenue += parseFloat(o.total || 0));

    document.getElementById('metric-total-orders').innerText = orders.length;
    document.getElementById('metric-total-revenue').innerText = '₹' + totalRevenue;

    db.collection('staff_registry').onSnapshot(snap => {
        let html = '';
        snap.forEach(doc => {
            const data = doc.data();
            html += `
                <div class="registry-card">
                    <div>
                        <div style="color: #fff; font-weight: bold;">${data.name}</div>
                        <div style="color: var(--text-muted);">${doc.id} | ${data.email}</div>
                    </div>
                    <button class="delete-staff-btn" title="Remove Staff" onclick="removeStaffMember('${doc.id}')">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            `;
        });
        document.getElementById('staff-registry-list').innerHTML = html;
    });
}

function addStaffMember() {
    const empId = document.getElementById('new-staff-id').value.trim();
    const name = document.getElementById('new-staff-name').value.trim();
    const email = document.getElementById('new-staff-email').value.trim();

    if(!empId || !name || !email) {
        showToast("Please fill all staff details.", "error");
        return;
    }

    db.collection('staff_registry').doc(empId).set({
        name: name,
        email: email
    }).then(() => {
        showToast("Staff member added to registry.", "success");
        document.getElementById('new-staff-id').value = '';
        document.getElementById('new-staff-name').value = '';
        document.getElementById('new-staff-email').value = '';
    }).catch(e => {
        showToast("Error adding staff: " + e.message, "error");
    });
}

function removeStaffMember(empId) {
    db.collection('staff_registry').doc(empId).delete().then(() => {
        showToast("Staff member removed from registry.", "success");
    }).catch(e => {
        showToast("Error removing staff: " + e.message, "error");
    });
}

function staffChangePassword() {
    const newPass = document.getElementById('staff-new-pass').value.trim();
    if(!newPass || newPass.length < 6) {
        showToast("Password must be at least 6 characters.", "error");
        return;
    }
    const user = auth.currentUser;
    if(user) {
        user.updatePassword(newPass).then(() => {
            showToast("Password updated successfully.", "success");
            document.getElementById('staff-new-pass').value = '';
        }).catch(e => {
            showToast("Error updating password: " + e.message, "error");
        });
    } else {
        showToast("No active user session found.", "error");
    }
}

function staffForgotPassword() {
    const user = auth.currentUser;
    if(user && user.email) {
        auth.sendPasswordResetEmail(user.email).then(() => {
            showToast(`Password reset link sent to ${user.email}`, "success");
        }).catch(e => {
            showToast("Error sending reset link: " + e.message, "error");
        });
    } else {
        showToast("Please contact support to reset your password.", "error");
    }
}

function staffForgotId() {
    showToast("Please contact the Founder (houseofsomaca@gmail.com) for ID/Email recovery.", "success");
}
