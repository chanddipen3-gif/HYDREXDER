// Dashboard Module

function renderDashboard() {
    const user = state.getCurrentUser();
    const isClient = user.role === 'client';

    let html = `
        <div class="animate-fade-in space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards">
                <!-- Cards injected here -->
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-semibold mb-4">${isClient ? 'Service History' : 'Revenue Overview'}</h3>
                    <canvas id="mainChart" height="250"></canvas>
                </div>

                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-semibold mb-4">Recent Jobs</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th class="px-4 py-2">Date</th>
                                    <th class="px-4 py-2">${isClient ? 'Cleaner' : 'Client'}</th>
                                    <th class="px-4 py-2">Status</th>
                                    <th class="px-4 py-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody id="recent-jobs-tbody">
                                <!-- Jobs injected here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    dom.mainContent.innerHTML = html;

    populateDashboardData(user);
}

function populateDashboardData(user) {
    const jobs = state.getJobs();
    const settings = state.getSettings();
    const cur = settings.currency;

    let relevantJobs = jobs;
    if (user.role === 'client') relevantJobs = jobs.filter(j => j.clientId === user.id);
    if (user.role === 'employee') relevantJobs = jobs.filter(j => j.employeeId === user.id);

    // Calculate KPIs
    const totalJobs = relevantJobs.length;
    const completedJobs = relevantJobs.filter(j => j.status === 'Completed').length;

    let totalRev = 0;
    relevantJobs.filter(j => j.status === 'Completed').forEach(j => totalRev += j.price);

    const kpiCards = document.getElementById('kpi-cards');

    if (user.role === 'admin') {
        const expenses = state.getExpenses().reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalRev - expenses;
        kpiCards.innerHTML = `
            ${createCard('Total Revenue', `${cur}${totalRev}`, 'fa-dollar-sign', 'text-green-500')}
            ${createCard('Net Profit', `${cur}${netProfit}`, 'fa-chart-line', 'text-blue-500')}
            ${createCard('Total Jobs', totalJobs, 'fa-briefcase', 'text-purple-500')}
            ${createCard('Active Clients', state.getUsers().filter(u=>u.role==='client').length, 'fa-users', 'text-orange-500')}
        `;
        initAdminChart(relevantJobs);
    } else if (user.role === 'employee') {
        const comm = totalRev * (settings.commissionRate / 100);
        kpiCards.innerHTML = `
            ${createCard('Jobs Completed', completedJobs, 'fa-check-circle', 'text-green-500')}
            ${createCard('Total Earnings', `${cur}${comm.toFixed(2)}`, 'fa-wallet', 'text-blue-500')}
        `;
        initEmployeeChart(relevantJobs);
    } else { // client
        kpiCards.innerHTML = `
            ${createCard('Total Services', completedJobs, 'fa-broom', 'text-green-500')}
            ${createCard('Total Spent', `${cur}${totalRev}`, 'fa-file-invoice-dollar', 'text-red-500')}
        `;
        initClientChart(relevantJobs);
    }

    // Populate Table
    const tbody = document.getElementById('recent-jobs-tbody');
    const recent = [...relevantJobs].reverse().slice(0, 5);

    recent.forEach(job => {
        const statusColor = job.status === 'Completed' ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300' :
                           job.status === 'Pending' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300' :
                           'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';

        let relName = 'N/A';
        if(user.role === 'client') {
            const emp = state.getUsers().find(u => u.id === job.employeeId);
            relName = emp ? emp.name : 'Unassigned';
        } else {
            const cl = state.getUsers().find(u => u.id === job.clientId);
            relName = cl ? cl.name : 'Unknown';
        }

        tbody.innerHTML += `
            <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-4 py-3">${job.date}</td>
                <td class="px-4 py-3 font-medium">${relName}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded text-xs font-semibold ${statusColor}">${job.status}</span>
                </td>
                <td class="px-4 py-3 text-right font-bold">${cur}${job.price}</td>
            </tr>
        `;
    });
}

function createCard(title, value, icon, iconColorClass) {
    return `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex items-center">
            <div class="p-3 rounded-full bg-gray-100 dark:bg-gray-700 mr-4">
                <i class="fas ${icon} text-2xl ${iconColorClass}"></i>
            </div>
            <div>
                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">${title}</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">${value}</p>
            </div>
        </div>
    `;
}

// Chart Configurations
function initAdminChart(jobs) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
                label: 'Revenue',
                data: [1200, 1900, 1500, 2200, 3000],
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function initEmployeeChart(jobs) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Jobs Completed',
                data: [3, 5, 2, 8],
                borderColor: 'rgb(16, 185, 129)',
                tension: 0.1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function initClientChart(jobs) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'In Progress'],
            datasets: [{
                data: [10, 2, 1],
                backgroundColor: ['#10B981', '#F59E0B', '#3B82F6']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Attach module entry to window
window.modules = window.modules || {};
window.modules.dashboard = renderDashboard;
