// scripts/home.js
const STATUS = {
    PENDING_ADEAM: 'pending_adeam',
    PENDING_ADMIN: 'pending_admin',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};
  
const STATUS_LABELS = {
    [STATUS.PENDING_ADEAM]: 'En attente ADEAM',
    [STATUS.PENDING_ADMIN]: 'En attente Admin',
    [STATUS.APPROVED]: 'Approuvé',
    [STATUS.REJECTED]: 'Rejeté'
};
  
const STATUS_CLASSES = {
    [STATUS.PENDING_ADEAM]: 'status-pending',
    [STATUS.PENDING_ADMIN]: 'status-pending',
    [STATUS.APPROVED]: 'status-approved',
    [STATUS.REJECTED]: 'status-rejected'
};

document.addEventListener('DOMContentLoaded', async () => {
    // Retrieve current user
    const currentUser = await checkAuth();

    // Show appropriate dashboard
    const dashboardId = `${currentUser.role.toLowerCase()}Dashboard`;
    const dashboard = document.getElementById(dashboardId);
    if (dashboard) {
        dashboard.classList.remove('hidden');
    }

    // Initialize flatpickr for date selection
    flatpickr("#multiple-dates", {
        mode: "multiple",
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: dates => {
            selectedDates = dates.map(date => date.toISOString().split('T')[0]);
        }
    });
});