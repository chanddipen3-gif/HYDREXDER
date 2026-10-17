// Settings & Multi-Currency Module

function renderSettings() {
    const settings = state.getSettings();

    let html = `
        <div class="animate-fade-in max-w-3xl space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h3 class="text-xl font-bold border-b dark:border-gray-700 pb-4 mb-6">Financial Configuration</h3>

                <form id="settings-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Base Currency Symbol</label>
                            <select id="set-currency" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                                <option value="$" ${settings.currency === '$' ? 'selected' : ''}>$ (USD/CAD/AUD)</option>
                                <option value="€" ${settings.currency === '€' ? 'selected' : ''}>€ (EUR)</option>
                                <option value="£" ${settings.currency === '£' ? 'selected' : ''}>£ (GBP)</option>
                                <option value="₹" ${settings.currency === '₹' ? 'selected' : ''}>₹ (INR)</option>
                                <option value="¥" ${settings.currency === '¥' ? 'selected' : ''}>¥ (JPY/CNY)</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Tax Rate (%)</label>
                            <input type="number" id="set-tax" value="${settings.taxRate}" min="0" max="100" step="0.1" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee Commission Base (%)</label>
                            <input type="number" id="set-comm" value="${settings.commissionRate}" min="0" max="100" class="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                        </div>
                    </div>

                    <div class="pt-4 border-t dark:border-gray-700 flex justify-end">
                        <button type="submit" class="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-6 rounded shadow transition">
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>

            <div class="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6">
                <h3 class="text-red-800 dark:text-red-400 font-bold mb-2"><i class="fas fa-exclamation-triangle mr-2"></i>Danger Zone</h3>
                <p class="text-sm text-red-600 dark:text-red-300 mb-4">Resetting the application will clear all data and restore it to the initial default state. This action cannot be undone.</p>
                <button id="reset-app-btn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition">
                    Factory Reset Application
                </button>
            </div>
        </div>
    `;

    dom.mainContent.innerHTML = html;

    document.getElementById('settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newCur = document.getElementById('set-currency').value;
        const newTax = parseFloat(document.getElementById('set-tax').value);
        const newComm = parseFloat(document.getElementById('set-comm').value);

        state.updateSettings({
            currency: newCur,
            taxRate: newTax,
            commissionRate: newComm
        });

        showToast('Settings saved successfully!');
    });

    document.getElementById('reset-app-btn').addEventListener('click', () => {
        if(confirm("Are you ABSOLUTELY sure? All current data will be lost.")) {
            localStorage.removeItem('cleanpro_data');
            window.location.reload();
        }
    });
}

window.modules = window.modules || {};
window.modules.settings = renderSettings;
