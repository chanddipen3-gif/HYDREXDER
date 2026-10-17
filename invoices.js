// Invoicing Module

function renderInvoices() {
    const user = state.getCurrentUser();
    const isAdmin = user.role === 'admin';

    let html = `
        <div class="animate-fade-in space-y-4">
            <div class="flex justify-between items-center mb-6">
                <div class="relative w-64">
                    <input type="text" id="invoice-search" placeholder="Search invoices..." class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
                ${isAdmin ? `
                <button class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow" onclick="alert('Generate Invoice')">
                    <i class="fas fa-file-invoice mr-2"></i> Generate
                </button>
                ` : ''}
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="overflow-x-auto data-table-container">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th class="px-6 py-3">Invoice ID</th>
                                <th class="px-6 py-3">Date</th>
                                ${isAdmin ? `<th class="px-6 py-3">Client</th>` : ''}
                                <th class="px-6 py-3 text-right">Amount</th>
                                <th class="px-6 py-3 text-center">Status</th>
                                <th class="px-6 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="invoices-tbody">
                            <!-- Data injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    dom.mainContent.innerHTML = html;

    populateInvoices();

    document.getElementById('invoice-search').addEventListener('input', (e) => {
        populateInvoices(e.target.value.toLowerCase());
    });
}

function populateInvoices(searchTerm = '') {
    const user = state.getCurrentUser();
    const isAdmin = user.role === 'admin';
    const settings = state.getSettings();
    const cur = settings.currency;
    const users = state.getUsers();

    let invoices = state.getInvoices();
    if(!isAdmin) {
        invoices = invoices.filter(i => i.clientId === user.id);
    }

    if(searchTerm) {
        invoices = invoices.filter(i => i.id.toLowerCase().includes(searchTerm) || (isAdmin && users.find(u=>u.id===i.clientId)?.name.toLowerCase().includes(searchTerm)));
    }

    const tbody = document.getElementById('invoices-tbody');
    tbody.innerHTML = '';

    if(invoices.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${isAdmin ? 6 : 5}" class="px-6 py-4 text-center text-gray-500">No invoices found.</td></tr>`;
        return;
    }

    invoices.forEach(inv => {
        const client = users.find(u => u.id === inv.clientId) || {name: 'Unknown'};
        const statusHtml = inv.status === 'Paid'
            ? `<span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</span>`
            : `<span class="px-2 py-1 text-xs rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Unpaid</span>`;

        let rowHtml = `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            <td class="px-6 py-4 font-medium text-primary">${inv.id}</td>
            <td class="px-6 py-4">${inv.date}</td>
        `;

        if(isAdmin) {
            rowHtml += `<td class="px-6 py-4">${client.name}</td>`;
        }

        rowHtml += `
            <td class="px-6 py-4 text-right font-bold">${cur}${inv.amount.toFixed(2)}</td>
            <td class="px-6 py-4 text-center">${statusHtml}</td>
            <td class="px-6 py-4 text-center">
                <button class="text-gray-500 hover:text-blue-500 mx-1" title="Download PDF" onclick="alert('Downloading PDF for ${inv.id}')"><i class="fas fa-file-pdf"></i></button>
        `;

        if(!isAdmin && inv.status === 'Unpaid') {
            rowHtml += `<button class="text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-xs mx-1" onclick="alert('Mock Payment Gateway')">Pay Now</button>`;
        }

        rowHtml += `</td></tr>`;
        tbody.innerHTML += rowHtml;
    });
}

window.modules = window.modules || {};
window.modules.invoices = renderInvoices;
