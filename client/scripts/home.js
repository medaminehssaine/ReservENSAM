const currentUser = checkAuth();
let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
let selectedDates = [];

window.addEventListener('DOMContentLoaded', () => {
    switch(currentUser.role) {
        case 'club':
            document.getElementById('clubDashboard').classList.remove('hidden');
            break;
        case 'adeam':
            document.getElementById('adeamDashboard').classList.remove('hidden');
            break;
        case 'admin':
            document.getElementById('adminDashboard').classList.remove('hidden');
            break;
    }
    updateDashboard();
    
    // Initialize flatpickr
    flatpickr("#multiple-dates", {
        mode: "multiple",
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: function(dates) {
            selectedDates = dates.map(date => date.toISOString().split('T')[0]);
        }
    });
});

function submitReservation() {
    // Get form values
    const objet = document.getElementById('objet').value;
    const type = document.getElementById('type').value;
    const participantsInternes = document.getElementById('participants-internes').value;
    const participantsExternes = document.getElementById('participants-externes').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const room = document.getElementById('room').value;
    
    // Get equipment values
    const tables = document.getElementById('tables').value;
    const chaises = document.getElementById('chaises').value;
    const sonorisation = document.getElementById('sonorisation').value;
    const videoprojecteurs = document.getElementById('videoprojecteurs').value;
    const autres = document.getElementById('autres').value;

    // Validation
    if (!objet || selectedDates.length === 0 || !startTime || !endTime || !room) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    // Create reservation objects for each selected date
    const newReservations = selectedDates.map(date => ({
        id: Date.now() + Math.random(), // Ensure unique IDs
        objet,
        type,
        date,
        startTime,
        endTime,
        room,
        participantsInternes: parseInt(participantsInternes),
        participantsExternes: parseInt(participantsExternes),
        equipment: {
            tables: parseInt(tables),
            chaises: parseInt(chaises),
            sonorisation: parseInt(sonorisation),
            videoprojecteurs: parseInt(videoprojecteurs),
            autres
        },
        status: 'pending_adeam',
        userId: currentUser.id,
        userName: currentUser.name
    }));

    // Add new reservations to existing ones
    reservations = [...reservations, ...newReservations];
    
    // Save to localStorage
    localStorage.setItem('reservations', JSON.stringify(reservations));
    
    // Reset form fields individually
    document.getElementById('objet').value = '';
    document.getElementById('type').selectedIndex = 0;
    document.getElementById('participants-internes').value = '';
    document.getElementById('participants-externes').value = '';
    document.getElementById('start-time').value = '';
    document.getElementById('end-time').value = '';
    document.getElementById('room').value = '';
    document.getElementById('tables').value = '0';
    document.getElementById('chaises').value = '0';
    document.getElementById('sonorisation').value = '0';
    document.getElementById('videoprojecteurs').value = '0';
    document.getElementById('autres').value = '';
    
    // Reset flatpickr
    const datePicker = document.querySelector('#multiple-dates')._flatpickr;
    datePicker.clear();
    selectedDates = [];
    
    // Update dashboard
    updateDashboard();
    
    alert('Réservation(s) soumise(s) avec succès');
}

function clearForm() {
    document.getElementById('objet').value = '';
    document.getElementById('type').selectedIndex = 0;
    document.getElementById('participants-internes').value = '';
    document.getElementById('participants-externes').value = '';
    document.getElementById('start-time').value = '';
    document.getElementById('end-time').value = '';
    document.getElementById('room').value = '';
    document.getElementById('tables').value = '0';
    document.getElementById('chaises').value = '0';
    document.getElementById('sonorisation').value = '0';
    document.getElementById('videoprojecteurs').value = '0';
    document.getElementById('autres').value = '';
    
    const datePicker = document.querySelector('#multiple-dates')._flatpickr;
    datePicker.clear();
    selectedDates = [];
}

function updateStatus(id, status) {
    reservations = reservations.map(r => 
        r.id === id ? {...r, status} : r
    );
    localStorage.setItem('reservations', JSON.stringify(reservations));
    updateDashboard();
}

function updateDashboard() {
    const storedReservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    switch(currentUser.role) {
        case 'club':
            document.getElementById('clubReservations').innerHTML = storedReservations.map(r => renderReservation(r)).join('');
            break;
        case 'adeam':
            document.getElementById('adeamReservations').innerHTML = storedReservations.map(r => renderReservation(r, true)).join('');
            break;
        case 'admin':
            const adminReservations = storedReservations.filter(r => r.status === 'pending_admin');
            document.getElementById('adminReservations').innerHTML = storedReservations.map(r => renderReservation(r, true)).join('');
            break;
    }
}

function renderReservation(reservation, showActions = false) {
    const statusClasses = {
        'pending_adeam': 'status-pending',
        'pending_admin': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected'
    };

    const statusText = {
        'pending_adeam': 'Pending ADEAM Approval',
        'pending_admin': 'Pending Admin Approval',
        'approved': 'Approved',
        'rejected': 'Rejected'
    };

    let actions = '';
    if (showActions) {
        if (currentUser.role === 'adeam' && reservation.status === 'pending_adeam') {
            actions = `
                <div class="reservation-actions">
                    <button onclick="updateStatus(${reservation.id}, 'pending_admin')">Approve</button>
                    <button onclick="updateStatus(${reservation.id}, 'rejected')" class="danger-btn">Reject</button>
                </div>
            `;
        } else if (currentUser.role === 'admin' && reservation.status === 'pending_admin') {
            actions = `
                <div class="reservation-actions">
                    <button onclick="updateStatus(${reservation.id}, 'approved')">Approve</button>
                    <button onclick="updateStatus(${reservation.id}, 'rejected')" class="danger-btn">Reject</button>
                </div>
            `;
        }
    }

    return `
        <div class="reservation-item">
            <div class="reservation-details">
                <h4>Room ${reservation.room}</h4>
                <p class="reservation-date">${reservation.date} de ${reservation.startTime} à ${reservation.startTime}</p>
                <p class="reservation-purpose">${reservation.objet}</p>
                <span class="status ${statusClasses[reservation.status]}">${statusText[reservation.status]}</span>
            </div>
            ${actions}
        </div>
    `;
}

const dateConfig = {
    mode: "multiple",
    dateFormat: "Y-m-d",
    enableTime: false,
    conjunction: ", ",
    minDate: "today",
    onChange: function(selectedDates, dateStr) {
        selectedDates = selectedDates.map(date => date.toISOString().split('T')[0]);
    }
};
flatpickr("#multiple-dates", dateConfig);
