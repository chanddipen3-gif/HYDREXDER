// Staff Management Module

function renderStaff() {
    let html = `
        <div class="animate-fade-in space-y-4">
            <div class="flex justify-between items-center mb-6">
                <div class="relative w-64">
                    <input type="text" id="staff-search" placeholder="Search employees..." class="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                </div>
                <button class="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow" onclick="alert('Add Staff modal')">
                    <i class="fas fa-user-plus mr-2"></i> Add Employee
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="staff-grid">
                <!-- Data injected here -->
            </div>
        </div>
    `;

    dom.mainContent.innerHTML = html;

    populateStaff();

    document.getElementById('staff-search').addEventListener('input', (e) => {
        populateStaff(e.target.value.toLowerCase());
    });
}

function populateStaff(searchTerm = '') {
    const employees = state.getUsers().filter(u => u.role === 'employee');
    const grid = document.getElementById('staff-grid');
    grid.innerHTML = '';

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm) ||
        e.id.toLowerCase().includes(searchTerm)
    );

    if(filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center text-gray-500 py-8">No employees found.</div>`;
        return;
    }

    const jobs = state.getJobs();

    filtered.forEach(emp => {
        const empJobs = jobs.filter(j => j.employeeId === emp.id);
        const completed = empJobs.filter(j => j.status === 'Completed').length;

        // Random performance score for mock
        const rating = (Math.random() * (5 - 4) + 4).toFixed(1);

        grid.innerHTML += `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 flex flex-col hover:shadow-lg transition">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center text-xl font-bold">
                            ${emp.name.charAt(0)}
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">${emp.name}</h3>
                            <p class="text-xs text-gray-500">${emp.id}</p>
                        </div>
                    </div>
                    <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><i class="fas fa-ellipsis-v"></i></button>
                </div>

                <div class="space-y-2 mb-6 flex-1">
                    <p class="text-sm text-gray-600 dark:text-gray-400"><i class="fas fa-envelope w-5 text-center mr-1"></i> ${emp.email}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400"><i class="fas fa-phone w-5 text-center mr-1"></i> ${emp.phone || 'N/A'}</p>
                </div>

                <div class="grid grid-cols-2 gap-4 border-t dark:border-gray-700 pt-4">
                    <div class="text-center">
                        <p class="text-xs text-gray-500 uppercase">Jobs Done</p>
                        <p class="text-lg font-bold text-gray-900 dark:text-white">${completed}</p>
                    </div>
                    <div class="text-center border-l dark:border-gray-700">
                        <p class="text-xs text-gray-500 uppercase">Rating</p>
                        <p class="text-lg font-bold text-yellow-500"><i class="fas fa-star text-sm mr-1"></i>${rating}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

window.modules = window.modules || {};
window.modules.staff = renderStaff;
