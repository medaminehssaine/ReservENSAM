// scripts/home.js
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve current user
    const currentUser = checkAuth();
    reservationManager.currentUser = currentUser; // Assign currentUser to the manager

    // Show appropriate dashboard
    const dashboardId = `${currentUser.role}Dashboard`;
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

    // Initialize dashboard with reservations
    reservationManager.updateUI();
});

// Collect form data and submit reservation
function submitReservation() {
    // Get form values and validate
    const formData = getFormData();
    if (!validateFormData(formData)) return;

    // Create reservations for each selected date
    const newReservations = selectedDates.map(date => ({
        id: Date.now() + Math.random(),
        ...formData,
        date,
        status: 'pending_adeam',
        userId: reservationManager.currentUser.username,
        userName: reservationManager.currentUser.username // Assuming username is the club name
    }));

    // Update reservations and storage
    reservationManager.updateReservations([...reservationManager.reservations, ...newReservations]);
    
    // Clear form inputs
    clearForm();
    alert('Réservation(s) soumise(s) avec succès');
}

// Function to collect form data
function getFormData() {
    return {
        objet: document.getElementById('objet').value,
        type: document.getElementById('type').value,
        participantsInternes: document.getElementById('participants-internes').value,
        participantsExternes: document.getElementById('participants-externes').value,
        startTime: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value,
        room: document.getElementById('room').value,
        equipment: {
            tables: document.getElementById('tables').value,
            chaises: document.getElementById('chaises').value,
            sonorisation: document.getElementById('sonorisation').value,
            videoprojecteurs: document.getElementById('videoprojecteurs').value,
            autres: document.getElementById('autres').value
        }
    };
}

// Function to validate form data
function validateFormData(formData) {
    for (const key in formData) {
        if (key === 'equipment') continue; // Skip equipment for now
        if (!formData[key]) {
            alert(`Veuillez remplir le champ ${key}.`);
            return false;
        }
    }
    return true;
}

// Clear form inputs after submission
function clearForm() {
    const formFields = ['objet', 'type', 'participants-internes', 'participants-externes',
                        'multiple-dates', 'start-time', 'end-time', 'room',
                        'tables', 'chaises', 'sonorisation', 'videoprojecteurs', 'autres'];
    formFields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            if (element.type === 'text' || element.type === 'number' || element.type === 'textarea') {
                element.value = '';
            } else if (element.type === 'select-one') {
                element.selectedIndex = 0;
            }
        }
    });
}

// Event listener for modal close button
document.querySelector('.modal-close').addEventListener('click', () => {
    reservationManager.closeModal();
});


document.querySelector('.approve-btn').addEventListener('click', () => {
    reservationManager.approve(reservationManager.currentRequestId);
});

document.querySelector('.reject-btn').addEventListener('click', () => {
    reservationManager.showRejectionForm(reservationManager.currentRequestId);
});

document.querySelector('.confirm-reject-btn').addEventListener('click', () => {
    const reason = document.getElementById('rejectionReason').value.trim();
    if (!reason) {
        alert('Veuillez fournir une raison de rejet');
        return;
    }
    reservationManager.reject(reservationManager.currentRequestId, reason);
});