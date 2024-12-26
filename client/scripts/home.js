const currentUser = checkAuth();
let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
let selectedDates = [];
let currentRequestId = null;

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

    document.querySelector('.approve-btn').addEventListener('click', () => {
        const newStatus = currentUser.role === 'adeam' ? 'pending_admin' : 'approved';
        updateStatus(currentRequestId, newStatus);
        document.getElementById('requestModal').classList.remove('active');
    });

    document.querySelector('.reject-btn').addEventListener('click', () => {
        document.querySelector('.rejection-form').classList.remove('hidden');
    });

    document.querySelector('.confirm-reject-btn').addEventListener('click', () => {
        const reason = document.getElementById('rejectionReason').value.trim();
        if (!reason) {
            alert('Veuillez fournir une raison de rejet');
            return;
        }
        updateStatus(currentRequestId, 'rejected', reason);
        document.getElementById('requestModal').classList.remove('active');
        document.querySelector('.rejection-form').classList.add('hidden');
        document.getElementById('rejectionReason').value = '';
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

function updateStatus(id, status, reason = '') {
    reservations = reservations.map(r => 
        r.id === id ? {...r, status, reason} : r
    );
    localStorage.setItem('reservations', JSON.stringify(reservations));
    updateDashboard();
}

function updateDashboard() {
    const storedReservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    switch(currentUser.role) {
        case 'club':
            document.getElementById('clubReservations').innerHTML = 
                storedReservations.filter(r => r.userId === currentUser.username)
                    .map(r => renderReservation(r)).join('');
            break;
        case 'adeam':
            document.getElementById('adeamReservations').innerHTML = 
                storedReservations.filter(r => r.status === 'pending_adeam')
                    .map(r => renderReservation(r, true)).join('');
            break;
        case 'admin':
            document.getElementById('adminReservations').innerHTML = 
                storedReservations.filter(r => r.status === 'pending_admin')
                    .map(r => renderReservation(r, true)).join('');
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

    const statusLabels = {
        'pending_adeam': 'En attente ADEAM',
        'pending_admin': 'En attente Admin',
        'approved': 'Approuvé',
        'rejected': 'Rejeté'
    };

    let actions = '';
    if (showActions) {
        const actionButtons = currentUser.role === 'adeam' ? 
            `<button onclick="updateStatus('${reservation.id}', 'pending_admin')" class="action-button accept-button">Approuver</button>` :
            `<button onclick="updateStatus('${reservation.id}', 'approved')" class="action-button accept-button">Approuver</button>`;
            
        actions = `
            <div class="reservation-actions">
                ${actionButtons}
                <button onclick="showRejectForm('${reservation.id}')" class="action-button reject-button">Rejeter</button>
            </div>
        `;
    }

    return `
        <div class="reservation-item" onclick="showRequestDetails('${reservation.id}')">
            <div class="reservation-details">
                <h4>${reservation.userName}</h4>
                <p class="reservation-date">${reservation.date} • ${reservation.startTime} - ${reservation.endTime}</p>
                <p class="reservation-room">Salle ${reservation.room}</p>
                <p class="reservation-purpose">${reservation.objet}</p>
                <span class="status ${statusClasses[reservation.status]}">${statusLabels[reservation.status]}</span>
            </div>
            ${actions}
        </div>
    `;
}

function showRequestDetails(requestId) {
    currentRequestId = requestId;
    const request = reservations.find(r => r.id === requestId);
    if (!request) return;

    const modal = document.getElementById('requestModal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <h2 class="modal-title">Détails de la Demande</h2>
        <div class="request-detail-grid">
            <p><strong>Club:</strong> ${request.userName}</p>
            <p><strong>Salle:</strong> ${request.room}</p>
            <p><strong>Date:</strong> ${request.date}</p>
            <p><strong>Horaire:</strong> ${request.startTime} - ${request.endTime}</p>
            <p><strong>Type:</strong> ${request.type}</p>
            <p><strong>Objet:</strong> ${request.objet}</p>
            <p><strong>Participants:</strong> ${request.participantsInternes} internes, ${request.participantsExternes} externes</p>
            <h3>Équipements:</h3>
            <ul>
                <li>Tables: ${request.equipment.tables}</li>
                <li>Chaises: ${request.equipment.chaises}</li>
                <li>Sonorisation: ${request.equipment.sonorisation}</li>
                <li>Vidéoprojecteurs: ${request.equipment.videoprojecteurs}</li>
                ${request.equipment.autres ? `<li>Autres: ${request.equipment.autres}</li>` : ''}
            </ul>
        </div>
    `;

    modal.classList.add('active');
}

// Add event listeners for modal close and confirm reject
document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('requestModal').classList.remove('active');
});

document.querySelector('.confirm-reject').addEventListener('click', () => {
    const reason = document.getElementById('rejectionReason').value;
    if (!reason) {
        alert('Veuillez fournir une raison de rejet');
        return;
    }
    updateStatus(currentRequestId, 'rejected', reason);
    document.getElementById('requestModal').classList.remove('active');
    document.querySelector('.rejection-form').classList.add('hidden');
    document.getElementById('rejectionReason').value = '';
});

document.querySelector('.approve-btn').addEventListener('click', () => {
    const newStatus = currentUser.role === 'adeam' ? 'pending_admin' : 'approved';
    updateStatus(currentRequestId, newStatus);
    document.getElementById('requestModal').classList.remove('active');
});

document.querySelector('.reject-btn').addEventListener('click', () => {
    document.querySelector('.rejection-form').classList.remove('hidden');
});

document.querySelector('.confirm-reject-btn').addEventListener('click', () => {
    const reason = document.getElementById('rejectionReason').value;
    if (!reason) {
        alert('Veuillez fournir une raison de rejet');
        return;
    }
    updateStatus(currentRequestId, 'rejected', reason);
    document.getElementById('requestModal').classList.remove('active');
    document.querySelector('.rejection-form').classList.add('hidden');
    document.getElementById('rejectionReason').value = '';
});

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