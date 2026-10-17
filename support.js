// Feedback and Support Ticketing Module

const MOCK_TICKETS = [
    { id: 'TKT-001', clientId: 'CL-001', jobId: 'JOB-1001', subject: 'Missed a spot in lobby', status: 'Open', date: '2024-05-10', priority: 'Medium' },
    { id: 'TKT-002', clientId: 'CL-001', jobId: 'JOB-1003', subject: 'Reschedule request', status: 'Closed', date: '2024-05-12', priority: 'High' }
];

function renderSupport() {
    const user = state.getCurrentUser();
    const isAdmin = user.role === 'admin';

    let html = `
        <div class="animate-fade-in space-y-6">
            <div class="flex justify-between items-center">
                <h3 class="text-xl font-bold">${isAdmin ? 'Helpdesk & Support Tickets' : 'My Support Tickets'}</h3>
                ${!isAdmin ? `
                <button class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow" onclick="alert('Open New Ticket')">
                    <i class="fas fa-ticket-alt mr-2"></i> Open Ticket
                </button>
                ` : ''}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Ticket List -->
                <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th class="px-4 py-3">Ticket ID</th>
                                    <th class="px-4 py-3">Subject</th>
                                    ${isAdmin ? `<th class="px-4 py-3">Client</th>` : ''}
                                    <th class="px-4 py-3">Priority</th>
                                    <th class="px-4 py-3">Status</th>
                                    <th class="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody id="tickets-tbody">
                                <!-- Data injected here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Client Feedback Summary (Admin only for now) -->
                ${isAdmin ? `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <h3 class="text-lg font-bold mb-4">Feedback Overview</h3>
                    <div class="flex items-center space-x-4 mb-6">
                        <div class="text-4xl font-bold text-yellow-500">4.8</div>
                        <div>
                            <div class="flex text-yellow-500 text-sm">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
                            </div>
                            <p class="text-sm text-gray-500">Average Rating (Based on 124 reviews)</p>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div>
                            <div class="flex justify-between text-xs mb-1"><span>5 Star</span><span>80%</span></div>
                            <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"><div class="bg-yellow-500 h-2 rounded-full" style="width: 80%"></div></div>
                        </div>
                        <div>
                            <div class="flex justify-between text-xs mb-1"><span>4 Star</span><span>15%</span></div>
                            <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"><div class="bg-yellow-500 h-2 rounded-full" style="width: 15%"></div></div>
                        </div>
                        <div>
                            <div class="flex justify-between text-xs mb-1"><span>3 Star</span><span>3%</span></div>
                            <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"><div class="bg-yellow-500 h-2 rounded-full" style="width: 3%"></div></div>
                        </div>
                        <div>
                            <div class="flex justify-between text-xs mb-1"><span>2 Star</span><span>1%</span></div>
                            <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"><div class="bg-yellow-500 h-2 rounded-full" style="width: 1%"></div></div>
                        </div>
                        <div>
                            <div class="flex justify-between text-xs mb-1"><span>1 Star</span><span>1%</span></div>
                            <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"><div class="bg-yellow-500 h-2 rounded-full" style="width: 1%"></div></div>
                        </div>
                    </div>
                </div>
                ` : `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center text-center">
                    <i class="fas fa-comments text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <h4 class="font-bold mb-2">We value your feedback!</h4>
                    <p class="text-sm text-gray-500 mb-4">Please rate your completed jobs in the Job Tracking tab to help us improve our service.</p>
                </div>
                `}
            </div>
        </div>
    `;

    dom.mainContent.innerHTML = html;
    populateTickets(isAdmin, user);
}

function populateTickets(isAdmin, user) {
    let tickets = MOCK_TICKETS;
    if(!isAdmin) tickets = tickets.filter(t => t.clientId === user.id);

    const tbody = document.getElementById('tickets-tbody');
    const users = state.getUsers();

    if(tickets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${isAdmin ? 6 : 5}" class="px-4 py-4 text-center text-gray-500">No support tickets found.</td></tr>`;
        return;
    }

    tickets.forEach(tkt => {
        const client = users.find(u => u.id === tkt.clientId) || {name: 'Unknown'};
        const prioColor = tkt.priority === 'High' ? 'text-red-500' : tkt.priority === 'Medium' ? 'text-yellow-500' : 'text-blue-500';
        const statColor = tkt.status === 'Open' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

        let rowHtml = `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="px-4 py-3 font-medium text-primary">${tkt.id}</td>
            <td class="px-4 py-3">
                <div class="font-medium">${tkt.subject}</div>
                <div class="text-xs text-gray-500">Ref: ${tkt.jobId}</div>
            </td>
        `;

        if(isAdmin) {
            rowHtml += `<td class="px-4 py-3 text-sm">${client.name}</td>`;
        }

        rowHtml += `
            <td class="px-4 py-3 font-bold ${prioColor}">${tkt.priority}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 text-xs rounded ${statColor}">${tkt.status}</span></td>
            <td class="px-4 py-3 text-center">
                <button class="text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded" onclick="alert('View Ticket ${tkt.id}')">View</button>
            </td>
        </tr>`;

        tbody.innerHTML += rowHtml;
    });
}

window.modules = window.modules || {};
window.modules.support = renderSupport;
