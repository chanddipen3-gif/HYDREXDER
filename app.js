// CleanPro State Management & Mock Data

const INITIAL_DATA = {
    users: [
        { id: 'ADM-001', password: 'password', role: 'admin', name: 'John Admin', email: 'admin@cleanpro.com' },
        { id: 'EMP-001', password: 'password', role: 'employee', name: 'Alice Cleaner', email: 'alice@cleanpro.com', phone: '555-0101' },
        { id: 'EMP-002', password: 'password', role: 'employee', name: 'Bob Sweeper', email: 'bob@cleanpro.com', phone: '555-0102' },
        { id: 'CL-001', password: 'password', role: 'client', name: 'Acme Corp', email: 'billing@acme.com', phone: '555-0201', address: '123 Business Pkwy', plan: 'Premium', subscriptionExpiry: '2025-12-31', subscriptionAmount: 500 },
        { id: 'CL-002', password: 'password', role: 'client', name: 'TechStart', email: 'admin@techstart.com', phone: '555-0202', address: '456 Startup Blvd', plan: 'Standard', subscriptionExpiry: '2023-01-01', subscriptionAmount: 250 } // Expired for testing
    ],
    jobs: [
        { id: 'JOB-1001', clientId: 'CL-001', employeeId: 'EMP-001', date: '2024-05-10', price: 150, status: 'Completed', checkIn: '08:00 AM', checkOut: '11:30 AM', checkInGPS: [40.7128, -74.0060], checkOutGPS: [40.7130, -74.0065] },
        { id: 'JOB-1002', clientId: 'CL-002', employeeId: 'EMP-002', date: '2024-05-11', price: 100, status: 'Pending', checkIn: null, checkOut: null, checkInGPS: null, checkOutGPS: null },
        { id: 'JOB-1003', clientId: 'CL-001', employeeId: 'EMP-001', date: '2024-05-12', price: 150, status: 'In Progress', checkIn: '09:00 AM', checkOut: null, checkInGPS: [40.7128, -74.0060], checkOutGPS: null }
    ],
    expenses: [
        { id: 'EXP-001', date: '2024-05-01', category: 'Supplies', description: 'Cleaning Chemicals', amount: 250 },
        { id: 'EXP-002', date: '2024-05-05', category: 'Transport', description: 'Gas for Van', amount: 50 }
    ],
    invoices: [
        { id: 'INV-2001', clientId: 'CL-001', date: '2024-05-01', amount: 500, status: 'Paid' },
        { id: 'INV-2002', clientId: 'CL-002', date: '2024-05-01', amount: 250, status: 'Unpaid' }
    ],
    settings: {
        currency: '$',
        taxRate: 10, // percentage
        commissionRate: 30 // percentage to employees
    },
    currentUser: null
};

class AppState {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        const stored = localStorage.getItem('cleanpro_data');
        if (stored) {
            return JSON.parse(stored);
        }
        localStorage.setItem('cleanpro_data', JSON.stringify(INITIAL_DATA));
        return JSON.parse(JSON.stringify(INITIAL_DATA));
    }

    saveData() {
        localStorage.setItem('cleanpro_data', JSON.stringify(this.data));
    }

    getUsers() { return this.data.users; }
    getJobs() { return this.data.jobs; }
    getExpenses() { return this.data.expenses; }
    getInvoices() { return this.data.invoices; }
    getSettings() { return this.data.settings; }
    getCurrentUser() { return this.data.currentUser; }

    setCurrentUser(user) {
        this.data.currentUser = user;
        this.saveData();
    }

    updateSettings(newSettings) {
        this.data.settings = { ...this.data.settings, ...newSettings };
        this.saveData();
    }
}

const state = new AppState();
window.appState = state; // Global access for simplicity in this vanilla JS app

// --- UI Utility Functions ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    toast.className = `${bgClass} text-white px-4 py-2 rounded shadow-lg flex items-center space-x-2 toast-enter`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.replace('toast-enter', 'toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- DOM Elements ---
const dom = {
    app: document.getElementById('app'),
    overlayContainer: document.getElementById('overlay-container'),
    authView: document.getElementById('auth-view'),
    paywallView: document.getElementById('paywall-view'),
    loginForm: document.getElementById('login-form'),
    loginId: document.getElementById('login-id'),
    loginPassword: document.getElementById('login-password'),
    loginError: document.getElementById('login-error'),
    logoutBtn: document.getElementById('logout-btn'),
    userName: document.getElementById('user-name'),
    userRole: document.getElementById('user-role'),
    userAvatar: document.getElementById('user-avatar'),
    navLinks: document.getElementById('nav-links'),
    mainContent: document.getElementById('main-content'),
    pageTitle: document.getElementById('page-title'),
    paywallAmount: document.getElementById('paywall-amount'),
    renewBtn: document.getElementById('renew-btn'),
    paywallLogout: document.getElementById('paywall-logout'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon')
};

// --- Authentication & Initialization ---
function init() {
    const user = state.getCurrentUser();
    setupTheme();

    if (!user) {
        showAuth();
    } else {
        handleUserLogin(user);
    }

    setupEventListeners();
}

function showAuth() {
    dom.overlayContainer.classList.remove('hidden');
    dom.authView.classList.remove('hidden');
    dom.paywallView.classList.add('hidden');
    dom.app.classList.add('filter', 'blur-sm'); // Blur background slightly
}

function handleLogin(e) {
    e.preventDefault();
    const id = dom.loginId.value.trim().toUpperCase();
    const password = dom.loginPassword.value;

    const user = state.getUsers().find(u => u.id === id && u.password === password);

    if (user) {
        dom.loginError.classList.add('hidden');
        state.setCurrentUser(user);
        handleUserLogin(user);
        dom.loginId.value = '';
        dom.loginPassword.value = '';
    } else {
        dom.loginError.classList.remove('hidden');
    }
}

function handleLogout() {
    state.setCurrentUser(null);
    showAuth();
    dom.mainContent.innerHTML = '';
}

function handleUserLogin(user) {
    // Check subscription status for clients
    if (user.role === 'client') {
        const today = new Date();
        const expiry = new Date(user.subscriptionExpiry);
        if (today > expiry) {
            showPaywall(user);
            return;
        }
    }

    // Grant access
    dom.overlayContainer.classList.add('hidden');
    dom.app.classList.remove('filter', 'blur-sm');

    // Update UI profile
    dom.userName.textContent = user.name;
    dom.userRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    dom.userAvatar.textContent = user.name.charAt(0).toUpperCase();

    buildNavigation(user.role);
    loadView('dashboard');
}

function showPaywall(user) {
    dom.overlayContainer.classList.remove('hidden');
    dom.authView.classList.add('hidden');
    dom.paywallView.classList.remove('hidden');
    dom.app.classList.add('filter', 'blur-sm');

    const settings = state.getSettings();
    dom.paywallAmount.textContent = `${settings.currency}${user.subscriptionAmount.toFixed(2)}`;
}

function handleRenew() {
    const user = state.getCurrentUser();
    if(user && user.role === 'client') {
        // Mock payment success
        const users = state.getUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if(idx !== -1) {
            // Add 1 year
            const newExpiry = new Date();
            newExpiry.setFullYear(newExpiry.getFullYear() + 1);
            users[idx].subscriptionExpiry = newExpiry.toISOString().split('T')[0];
            state.data.users = users;
            state.setCurrentUser(users[idx]);
            state.saveData();
            showToast('Subscription Renewed Successfully!', 'success');
            handleUserLogin(users[idx]);
        }
    }
}

// Navigation structure
const NAV_MENU = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard', roles: ['admin', 'client', 'employee'] },
    { id: 'clients', icon: 'fa-users', label: 'Client CRM', roles: ['admin'] },
    { id: 'jobs', icon: 'fa-clipboard-list', label: 'Job Tracking', roles: ['admin', 'employee'] },
    { id: 'staff', icon: 'fa-id-badge', label: 'Staff Management', roles: ['admin'] },
    { id: 'gps', icon: 'fa-map-location-dot', label: 'Live GPS', roles: ['admin'] },
    { id: 'financials', icon: 'fa-money-bill-wave', label: 'Salary & Payouts', roles: ['admin', 'employee'] },
    { id: 'invoices', icon: 'fa-file-invoice-dollar', label: 'Invoices', roles: ['admin', 'client'] },
    { id: 'expenses', icon: 'fa-receipt', label: 'Expenses', roles: ['admin'] },
    { id: 'support', icon: 'fa-headset', label: 'Support & Feedback', roles: ['admin', 'client'] },
    { id: 'settings', icon: 'fa-cog', label: 'Settings', roles: ['admin'] }
];

function buildNavigation(role) {
    dom.navLinks.innerHTML = '';
    const filteredNav = NAV_MENU.filter(item => item.roles.includes(role));

    filteredNav.forEach(item => {
        const li = document.createElement('li');
        li.className = 'px-2';
        li.innerHTML = `
            <a href="#" data-view="${item.id}" class="nav-item flex items-center space-x-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition">
                <i class="fas ${item.icon} w-5 text-center"></i>
                <span>${item.label}</span>
            </a>
        `;
        dom.navLinks.appendChild(li);
    });

    // Add click events to nav
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Remove active state from all
            document.querySelectorAll('.nav-item').forEach(l => {
                l.classList.remove('bg-gray-800', 'text-white');
                l.classList.add('text-gray-300');
            });
            // Add active state
            const target = e.currentTarget;
            target.classList.remove('text-gray-300');
            target.classList.add('bg-gray-800', 'text-white');

            const viewId = target.getAttribute('data-view');
            loadView(viewId);

            // Close mobile menu
            if(window.innerWidth < 768) {
                document.getElementById('sidebar').classList.add('hidden');
            }
        });
    });
}

function loadView(viewId) {
    const navItem = NAV_MENU.find(n => n.id === viewId);
    if(navItem) dom.pageTitle.textContent = navItem.label;

    // Check if module exists
    if (window.modules && window.modules[viewId]) {
        window.modules[viewId]();
    } else {
        dom.mainContent.innerHTML = `<div class="animate-fade-in"><h2 class="text-2xl font-bold mb-4">${navItem ? navItem.label : 'View'}</h2><p class="text-gray-500">Module under construction...</p></div>`;
    }
}

function setupTheme() {
    const isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
        document.documentElement.classList.add('dark');
        dom.themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        document.documentElement.classList.remove('dark');
        dom.themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
}

function setupEventListeners() {
    dom.loginForm.addEventListener('submit', handleLogin);
    dom.logoutBtn.addEventListener('click', handleLogout);
    dom.paywallLogout.addEventListener('click', handleLogout);
    dom.renewBtn.addEventListener('click', handleRenew);

    dom.themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (isDark) {
            dom.themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            dom.themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    });

    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('hidden');
    });

    document.getElementById('toggle-sidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('hidden');
    });
}

// Start App
document.addEventListener('DOMContentLoaded', init);
