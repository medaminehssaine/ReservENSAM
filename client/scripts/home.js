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

async function approveReservation(reservationId, role) {
    try {
        const response = await fetch(`http://localhost/ReservENSAM/server/api/approve_reservation.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reservationId,
                role,
                token: JSON.parse(localStorage.getItem('currentUser')).token
            })
        });

        const data = await response.json();
        if (data.success) {
            location.reload();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while approving the reservation.');
    }
}

async function rejectReservation(reservationId, role) {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
        const response = await fetch(`http://localhost/ReservENSAM/server/api/reject_reservation.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reservationId,
                role,
                reason,
                token: JSON.parse(localStorage.getItem('currentUser')).token
            })
        });

        const data = await response.json();
        if (data.success) {
            location.reload();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while rejecting the reservation.');
    }
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
                <button onclick="approveReservation(${reservation.id}, '${role}')" 
                        class="action-button accept-button">Approuver</button>
                <button onclick="rejectReservation(${reservation.id}, '${role}')" 
                        class="action-button reject-button">Rejeter</button>
            </div>
        </div>
    `;
}

function displayReservations(reservations, containerId, role) {
    const container = document.getElementById(containerId);
    container.innerHTML = reservations.map(reservation => 
        createReservationHTML(reservation, role)
    ).join('');
}