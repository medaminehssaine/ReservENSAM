const currentUser = checkAuth();
let reservations = JSON.parse(localStorage.getItem('reservations')) || [];

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
});

function submitReservation() {
    const room = document.getElementById('room').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const purpose = document.getElementById('purpose').value;

    if (!room || !date || !time || !purpose) {
        alert('Please fill all fields');
        return;
    }

    const reservation = {
        id: Date.now(),
        room,
        date,
        time,
        purpose,
        club: currentUser.username,
        status: 'pending_adeam',
        created_at: new Date().toISOString()
    };

    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    updateDashboard();
    clearForm();
}

function clearForm() {
    document.getElementById('room').value = '';
    document.getElementById('date').value = '';
    document.getElementById('time').value = '';
    document.getElementById('purpose').value = '';
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
            const clubReservations = storedReservations.filter(r => r.club === currentUser.username);
            document.getElementById('clubReservations').innerHTML = clubReservations.map(r => renderReservation(r)).join('');
            break;
        case 'adeam':
            const adeamReservations = storedReservations.filter(r => r.status === 'pending_adeam');
            document.getElementById('adeamReservations').innerHTML = adeamReservations.map(r => renderReservation(r, true)).join('');
            break;
        case 'admin':
            const adminReservations = storedReservations.filter(r => r.status === 'pending_admin');
            document.getElementById('adminReservations').innerHTML = adminReservations.map(r => renderReservation(r, true)).join('');
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
                <p class="reservation-date">${reservation.date} at ${reservation.time}</p>
                <p class="reservation-purpose">${reservation.purpose}</p>
                <span class="status ${statusClasses[reservation.status]}">${statusText[reservation.status]}</span>
            </div>
            ${actions}
        </div>
    `;
}
