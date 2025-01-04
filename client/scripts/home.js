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

let selectedDates = []; // Define selectedDates at the top

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

    loadReservations();
});

function approveReservation(button) {
    const reservationItem = button.closest('.reservation-item');
    const reservationId = reservationItem.dataset.id;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    fetch('http://localhost/ReservENSAM/server/api/approve_reservation.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
            id: reservationId,
            user_id: currentUser.id,
            user_role: currentUser.role
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            reservationItem.remove();
        }
    });
}

function rejectReservation(button) {
    const reservationItem = button.closest('.reservation-item');
    const reservationId = reservationItem.dataset.id;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const reason = prompt('Raison du rejet:');
    if (!reason) return;

    fetch('http://localhost/ReservENSAM/server/api/reject_reservation.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
            id: reservationId,
            reason: reason,
            user_id: currentUser.id,
            user_role: currentUser.role
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            reservationItem.remove();
        }
    });
}

async function loadReservations() {
    const response = await fetch('http://localhost/ReservENSAM/server/api/get_reservations.php', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    
    const reservations = await response.json();
    displayReservations(reservations);
}

function displayReservations(reservations) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const container = document.getElementById(`${currentUser.role.toLowerCase()}Reservations`);
    
    container.innerHTML = reservations.map(reservation => `
        <div class="reservation-item">
            <div class="reservation-details">
                <p><strong>Club:</strong> ${reservation.club_name}</p>
                <p><strong>Date:</strong> ${reservation.start_date}</p>
                <p><strong>Heure:</strong> ${reservation.start_time} - ${reservation.end_time}</p>
                <p><strong>Status:</strong> <span class="status ${reservation.status.toLowerCase()}">${reservation.status}</span></p>
            </div>
            ${currentUser.role !== 'CLUB' ? `
                <div class="reservation-actions">
                    <button onclick="approveReservation(this)" class="action-button accept-button">
                        Approuver
                    </button>
                    <button onclick="rejectReservation(this)" class="action-button reject-button">
                        Rejeter
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function createReservationHTML(reservation, role) {
    return `
        <div class="reservation-item" data-id="${reservation.id}">
            <div class="reservation-details">
                <p><strong>Date:</strong> ${reservation.date}</p>
                <p><strong>Heure:</strong> ${reservation.time}</p>
                <p><strong>Salle:</strong> ${reservation.room}</p>
                <p><strong>Status:</strong> ${reservation.status}</p>
            </div>
            <div class="reservation-actions">
                <button onclick="approveReservation(this)" 
                        class="action-button accept-button">Approuver</button>
                <button onclick="rejectReservation(this)" 
                        class="action-button reject-button">Rejeter</button>
            </div>
        </div>
    `;
}

function submitReservation() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const reservationData = {
        club_id: currentUser.id,
        activity_description: document.getElementById('objet').value,
        event_type: document.getElementById('type').value,
        internal_attendees: document.getElementById('participants-internes').value,
        external_attendees: document.getElementById('participants-externes').value,
        dates: selectedDates,
        start_time: document.getElementById('start-time').value,
        end_time: document.getElementById('end-time').value,
        room: document.getElementById('room').value,
        required_equipment: {
            tables: document.getElementById('tables').value,
            videoprojecteurs: document.getElementById('videoprojecteurs').value,
            autres: document.getElementById('autres').value
        }
    };

    fetch('http://localhost/ReservENSAM/server/api/submit_reservation.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reservationData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Reservation submitted successfully');
            loadReservations();
        } else {
            alert('Failed to submit reservation');
        }
    });
}