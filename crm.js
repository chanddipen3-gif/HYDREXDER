// Client CRM Module

function renderClients() {
    let html = `
        <div class="animate-fade-in space-y-4">
            <div class="flex justify-between items-center mb-6">
                <div class="relative w-64">
                    <input type="text" id="client-search" placeholder="Search clients..." class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
                <button class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow" onclick="alert('Add Client modal')">
                    <i class="fas fa-plus mr-2"></i> Add Client
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="overflow-x-auto data-table-container">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th class="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Client ID <i class="fas fa-sort ml-1"></i></th>
                                <th class="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">Name <i class="fas fa-sort ml-1"></i></th>
                                <th class="px-6 py-3">Contact</th>
                                <th class="px-6 py-3">Address</th>
                                <th class="px-6 py-3">Plan</th>
                                <th class="px-6 py-3">Expiry</th>
                                <th class="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="crm-tbody">
                            <!-- Data injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    dom.mainContent.innerHTML = html;

    populateCRM();

    document.getElementById('client-search').addEventListener('input', (e) => {
        populateCRM(e.target.value.toLowerCase());
    });
}

function populateCRM(searchTerm = '') {
    const clients = state.getUsers().filter(u => u.role === 'client');
    const tbody = document.getElementById('crm-tbody');
    tbody.innerHTML = '';

    const filtered = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm) ||
        c.id.toLowerCase().includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm)
    );

    if(filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">No clients found.</td></tr>`;
        return;
    }

    filtered.forEach(client => {
        const isExpired = new Date(client.subscriptionExpiry) < new Date();
        const expiryClass = isExpired ? 'text-red-600 font-bold' : 'text-green-600';

        tbody.innerHTML += `
            <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${client.id}</td>
                <td class="px-6 py-4">${client.name}</td>
                <td class="px-6 py-4">
                    <div class="text-xs"><i class="fas fa-phone text-gray-400 w-4"></i> ${client.phone || 'N/A'}</div>
                    <div class="text-xs"><i class="fas fa-envelope text-gray-400 w-4"></i> ${client.email}</div>
                </td>
                <td class="px-6 py-4 truncate max-w-xs" title="${client.address}">${client.address}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-900 dark:text-blue-300">${client.plan}</span></td>
                <td class="px-6 py-4 ${expiryClass}">${client.subscriptionExpiry}</td>
                <td class="px-6 py-4 text-center">
                    <button class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-2" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

window.modules = window.modules || {};
window.modules.clients = renderClients;
