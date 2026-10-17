// Job Tracking Module

function renderJobs() {
    const user = state.getCurrentUser();
    const isAdmin = user.role === 'admin';
    const isEmp = user.role === 'employee';

    let html = `
        <div class="animate-fade-in space-y-4">
            <div class="flex justify-between items-center mb-6">
                <div class="flex space-x-2">
                    <select id="job-status-filter" class="border rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-700">
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                ${isAdmin ? `
                <button class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow" onclick="alert('New Job modal')">
                    <i class="fas fa-plus mr-2"></i> New Job
                </button>
                ` : ''}
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="overflow-x-auto data-table-container">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th class="px-4 py-3">Date</th>
                                <th class="px-4 py-3">Job ID</th>
                                ${isAdmin || isEmp ? `<th class="px-4 py-3">Client</th>` : ''}
                                ${isAdmin ? `<th class="px-4 py-3">Assigned To</th>` : ''}
                                <th class="px-4 py-3">Status</th>
                                <th class="px-4 py-3">Check-In</th>
                                <th class="px-4 py-3">Check-Out</th>
                                ${isAdmin ? `<th class="px-4 py-3 text-right">Price</th>` : ''}
                                ${isEmp ? `<th class="px-4 py-3 text-right">Est. Comm.</th>` : ''}
                                <th class="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="jobs-tbody">
                            <!-- Data injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    dom.mainContent.innerHTML = html;

    populateJobs();

    document.getElementById('job-status-filter').addEventListener('change', (e) => {
        populateJobs(e.target.value);
    });
}

function populateJobs(statusFilter = 'all') {
    const user = state.getCurrentUser();
    let jobs = state.getJobs();
    const settings = state.getSettings();
    const users = state.getUsers();

    // Role based filtering
    if(user.role === 'employee') jobs = jobs.filter(j => j.employeeId === user.id);
    if(user.role === 'client') jobs = jobs.filter(j => j.clientId === user.id);

    // Status filter
    if(statusFilter !== 'all') jobs = jobs.filter(j => j.status === statusFilter);

    const tbody = document.getElementById('jobs-tbody');
    tbody.innerHTML = '';

    if(jobs.length === 0) {
        // Adjust colspan based on role dynamically
        const cols = user.role === 'admin' ? 9 : user.role === 'employee' ? 8 : 6;
        tbody.innerHTML = `<tr><td colspan="${cols}" class="px-6 py-4 text-center text-gray-500">No jobs found.</td></tr>`;
        return;
    }

    jobs.forEach(job => {
        const client = users.find(u => u.id === job.clientId) || {name: 'Unknown'};
        const emp = users.find(u => u.id === job.employeeId) || {name: 'Unassigned'};

        const statusColor = job.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                           job.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                           'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';

        const comm = (job.price * (settings.commissionRate / 100)).toFixed(2);

        // Action buttons based on role and status
        let actions = '';
        if(user.role === 'admin') {
            actions = `
                <button class="text-blue-600 hover:text-blue-900 mx-1" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="text-red-600 hover:text-red-900 mx-1" title="Delete"><i class="fas fa-trash"></i></button>
            `;
        } else if(user.role === 'employee') {
            if(job.status === 'Pending') {
                actions = `<button class="bg-blue-500 text-white px-2 py-1 text-xs rounded" onclick="appState.updateJob('${job.id}', 'In Progress'); renderJobs(); showToast('Checked In')">Check In</button>`;
            } else if(job.status === 'In Progress') {
                actions = `<button class="bg-green-500 text-white px-2 py-1 text-xs rounded" onclick="appState.updateJob('${job.id}', 'Completed'); renderJobs(); showToast('Checked Out')">Check Out</button>`;
            } else {
                actions = `<span class="text-gray-400"><i class="fas fa-check"></i></span>`;
            }
        } else {
            // Client actions (e.g., rate, dispute)
            if(job.status === 'Completed') {
                actions = `<button class="text-yellow-500 hover:text-yellow-600" title="Rate Job"><i class="fas fa-star"></i></button>`;
            } else {
                actions = `<span class="text-gray-400">-</span>`;
            }
        }

        let rowHtml = `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="px-4 py-3">${job.date}</td>
            <td class="px-4 py-3 font-medium text-primary">${job.id}</td>`;

        if(user.role === 'admin' || user.role === 'employee') {
            rowHtml += `<td class="px-4 py-3 truncate max-w-[150px]" title="${client.name}">${client.name}</td>`;
        }
        if(user.role === 'admin') {
            rowHtml += `<td class="px-4 py-3">${emp.name}</td>`;
        }

        rowHtml += `
            <td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded-full ${statusColor}">${job.status}</span></td>
            <td class="px-4 py-3 text-xs text-gray-500">${job.checkIn || '-'}</td>
            <td class="px-4 py-3 text-xs text-gray-500">${job.checkOut || '-'}</td>
        `;

        if(user.role === 'admin') {
            rowHtml += `<td class="px-4 py-3 text-right font-medium">${settings.currency}${job.price}</td>`;
        }
        if(user.role === 'employee') {
            rowHtml += `<td class="px-4 py-3 text-right font-medium text-green-600">${settings.currency}${comm}</td>`;
        }

        rowHtml += `<td class="px-4 py-3 text-center">${actions}</td></tr>`;

        tbody.innerHTML += rowHtml;
    });
}

// Add a helper to appState for employee checkin/checkout mock
AppState.prototype.updateJob = function(jobId, newStatus) {
    const jobs = this.getJobs();
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    if(jobIndex !== -1) {
        jobs[jobIndex].status = newStatus;
        const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        if(newStatus === 'In Progress') {
            jobs[jobIndex].checkIn = now;
            // Mock GPS
            jobs[jobIndex].checkInGPS = [40.7128 + (Math.random()*0.01), -74.0060 + (Math.random()*0.01)];
        } else if (newStatus === 'Completed') {
            jobs[jobIndex].checkOut = now;
            jobs[jobIndex].checkOutGPS = [40.7128 + (Math.random()*0.01), -74.0060 + (Math.random()*0.01)];
        }
        this.data.jobs = jobs;
        this.saveData();
    }
}

window.modules = window.modules || {};
window.modules.jobs = renderJobs;
