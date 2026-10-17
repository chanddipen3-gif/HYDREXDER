// Salary & Payouts Module

function renderFinancials() {
    const user = state.getCurrentUser();
    const isAdmin = user.role === 'admin';
    const settings = state.getSettings();
    const cur = settings.currency;

    let html = `
        <div class="animate-fade-in space-y-6">
            ${isAdmin ? `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <p class="text-sm text-gray-500">Total Payouts This Month</p>
                    <p class="text-2xl font-bold" id="total-payouts">${cur}0.00</p>
                </div>
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-yellow-500">
                    <p class="text-sm text-gray-500">Pending Commissions</p>
                    <p class="text-2xl font-bold" id="pending-commissions">${cur}0.00</p>
                </div>
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-500">
                    <p class="text-sm text-gray-500">Commission Rate</p>
                    <p class="text-2xl font-bold">${settings.commissionRate}%</p>
                </div>
            </div>
            ` : ''}

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 class="text-lg font-semibold">${isAdmin ? 'Staff Payout Ledger' : 'My Earnings'}</h3>
                    ${isAdmin ? `<button class="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded" onclick="alert('Process all pending payouts')">Process All</button>` : ''}
                </div>
                <div class="overflow-x-auto data-table-container">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                ${isAdmin ? `<th class="px-6 py-3">Employee</th>` : ''}
                                <th class="px-6 py-3 text-right">Jobs Completed</th>
                                <th class="px-6 py-3 text-right">Total Revenue Generated</th>
                                <th class="px-6 py-3 text-right">Commission Earned</th>
                                <th class="px-6 py-3 text-center">Status</th>
                                ${isAdmin ? `<th class="px-6 py-3 text-center">Action</th>` : ''}
                            </tr>
                        </thead>
                        <tbody id="payout-tbody">
                            <!-- Data injected here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    dom.mainContent.innerHTML = html;

    populateFinancials(isAdmin);
}

function populateFinancials(isAdmin) {
    const user = state.getCurrentUser();
    const settings = state.getSettings();
    const cur = settings.currency;
    const rate = settings.commissionRate / 100;

    let employees = state.getUsers().filter(u => u.role === 'employee');
    if(!isAdmin) {
        employees = [user]; // Self only for employee
    }

    const jobs = state.getJobs();
    const tbody = document.getElementById('payout-tbody');
    tbody.innerHTML = '';

    let totalPayouts = 0;
    let pendingCommissions = 0;

    employees.forEach(emp => {
        const empJobs = jobs.filter(j => j.employeeId === emp.id && j.status === 'Completed');
        const count = empJobs.length;
        let rev = 0;
        empJobs.forEach(j => rev += j.price);

        const comm = rev * rate;

        // Mocking a status. Let's say randomly some are paid, some pending.
        // For determinism in mock: if rev > 200 it's pending, else paid.
        const status = rev > 200 ? 'Pending' : 'Paid';

        if(status === 'Paid') totalPayouts += comm;
        if(status === 'Pending') pendingCommissions += comm;

        const statusHtml = status === 'Paid'
            ? `<span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Paid</span>`
            : `<span class="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</span>`;

        let rowHtml = `<tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">`;

        if(isAdmin) {
            rowHtml += `<td class="px-6 py-4 font-medium">${emp.name} <span class="text-xs text-gray-500 block">${emp.id}</span></td>`;
        }

        rowHtml += `
            <td class="px-6 py-4 text-right">${count}</td>
            <td class="px-6 py-4 text-right">${cur}${rev.toFixed(2)}</td>
            <td class="px-6 py-4 text-right font-bold text-blue-600 dark:text-blue-400">${cur}${comm.toFixed(2)}</td>
            <td class="px-6 py-4 text-center">${statusHtml}</td>
        `;

        if(isAdmin) {
            if(status === 'Pending') {
                rowHtml += `<td class="px-6 py-4 text-center"><button class="text-sm bg-blue-500 text-white px-2 py-1 rounded" onclick="alert('Pay ${emp.name}'); renderFinancials()">Pay Now</button></td>`;
            } else {
                rowHtml += `<td class="px-6 py-4 text-center text-gray-400"><i class="fas fa-check"></i></td>`;
            }
        }

        rowHtml += `</tr>`;
        tbody.innerHTML += rowHtml;
    });

    if(isAdmin) {
        const el1 = document.getElementById('total-payouts');
        const el2 = document.getElementById('pending-commissions');
        if(el1) el1.textContent = `${cur}${totalPayouts.toFixed(2)}`;
        if(el2) el2.textContent = `${cur}${pendingCommissions.toFixed(2)}`;
    }
}

window.modules = window.modules || {};
window.modules.financials = renderFinancials;
