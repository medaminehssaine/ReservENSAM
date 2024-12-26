const users = {
    'club1': { password: 'club123', role: 'club' },
    'club2': { password: 'club456', role: 'club' },
    'club3': { password: 'club789', role: 'club' },
    'adeam': { password: 'adeam123', role: 'adeam' },
    'admin': { password: 'admin123', role: 'admin' }
};
// Initialize users in localStorage if not exists
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify(users));
}

// Initialize reservations in localStorage if not exists
if (!localStorage.getItem('reservations')) {
  localStorage.setItem('reservations', JSON.stringify([]));
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
      window.location.href = 'login.html';
  }
  return currentUser;
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
        <div class="reservation-item">
            <div class="reservation-details" onclick="showRequestDetails('${reservation.id}')">
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

document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('requestModal').classList.remove('active');
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