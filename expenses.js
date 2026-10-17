// Expenses Tracking Module

function renderExpenses() {
    let html = `
        <div class="animate-fade-in space-y-4">
            <div class="flex justify-between items-center mb-6">
                <div class="relative w-64">
                    <input type="text" id="expense-search" placeholder="Search expenses..." class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
                <button class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow" onclick="alert('Log New Expense modal')">
                    <i class="fas fa-plus mr-2"></i> Log Expense
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div class="overflow-x-auto data-table-container">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th class="px-6 py-3">Date</th>
                                <th class="px-6 py-3">Expense ID</th>
                                <th class="px-6 py-3">Category</th>
                                <th class="px-6 py-3">Description</th>
                                <th class="px-6 py-3 text-right">Amount</th>
                                <th class="px-6 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="expenses-tbody">
                            <!-- Data injected here -->
                        </tbody>
                        <tfoot class="bg-gray-50 dark:bg-gray-700 font-bold">
                            <tr>
                                <td colspan="4" class="px-6 py-3 text-right">Total Expenses:</td>
                                <td class="px-6 py-3 text-right text-red-500" id="expenses-total">$0.00</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    `;

    dom.mainContent.innerHTML = html;

    populateExpenses();

    document.getElementById('expense-search').addEventListener('input', (e) => {
        populateExpenses(e.target.value.toLowerCase());
    });
}

function populateExpenses(searchTerm = '') {
    const settings = state.getSettings();
    const cur = settings.currency;
    let expenses = state.getExpenses();

    if(searchTerm) {
        expenses = expenses.filter(e =>
            e.id.toLowerCase().includes(searchTerm) ||
            e.category.toLowerCase().includes(searchTerm) ||
            e.description.toLowerCase().includes(searchTerm)
        );
    }

    const tbody = document.getElementById('expenses-tbody');
    tbody.innerHTML = '';

    let total = 0;

    if(expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No expenses found.</td></tr>`;
        document.getElementById('expenses-total').textContent = `${cur}0.00`;
        return;
    }

    expenses.forEach(exp => {
        total += exp.amount;

        let icon = 'fa-receipt';
        if(exp.category === 'Supplies') icon = 'fa-pump-soap';
        if(exp.category === 'Transport') icon = 'fa-gas-pump';

        tbody.innerHTML += `
            <tr class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-6 py-4">${exp.date}</td>
                <td class="px-6 py-4 font-medium">${exp.id}</td>
                <td class="px-6 py-4"><i class="fas ${icon} mr-2 text-gray-400"></i>${exp.category}</td>
                <td class="px-6 py-4">${exp.description}</td>
                <td class="px-6 py-4 text-right font-bold">${cur}${exp.amount.toFixed(2)}</td>
                <td class="px-6 py-4 text-center">
                    <button class="text-blue-600 hover:text-blue-900 mx-1" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="text-red-600 hover:text-red-900 mx-1" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });

    document.getElementById('expenses-total').textContent = `${cur}${total.toFixed(2)}`;
}

window.modules = window.modules || {};
window.modules.expenses = renderExpenses;
