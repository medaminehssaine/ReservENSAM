// scripts/general.js
if (!localStorage.getItem('reservations')) {
localStorage.setItem('reservations', JSON.stringify([]));
}

function logout() {
localStorage.removeItem('currentUser');
window.location.href = 'login.html';
}

async function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch("http://localhost/ReservENSAM/server/api/verify_token.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: currentUser.token }),
        });

        const data = await response.json();

        if (!data.success || data.role !== currentUser.role) {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error("Error verifying token:", error);
        window.location.href = 'login.html';
    }

    return currentUser;
}

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

class ReservationManager {
  constructor() {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.reservations = JSON.parse(localStorage.getItem('reservations')) || [];
      this.currentRequestId = null;
  }

  updateReservations(newReservations) {
      this.reservations = newReservations;
      localStorage.setItem('reservations', JSON.stringify(newReservations));
      this.updateUI();
  }

  updateStatus(requestId, newStatus, reason = '') {
      const updatedReservations = this.reservations.map(r => 
          r.id === requestId ? {...r, status: newStatus, reason: reason || r.reason} : r
      );
      this.updateReservations(updatedReservations);
  }

  approve(requestId) {
      const request = this.reservations.find(r => r.id === requestId);
      if (this.currentUser.role === 'adeam' && request.status === STATUS.PENDING_ADEAM) {
          this.updateStatus(requestId, STATUS.PENDING_ADMIN);
      } else if (this.currentUser.role === 'admin' && request.status === STATUS.PENDING_ADMIN) {
          this.updateStatus(requestId, STATUS.APPROVED);
      } else {
          alert("Cannot approve this request at this stage.");
      }
      this.closeModal();
  }

  reject(requestId, reason) {
      this.updateStatus(requestId, STATUS.REJECTED, reason);
      this.closeModal();
  }

  closeModal() {
      const modal = document.getElementById('requestModal');
      modal.classList.remove('active');
      document.querySelector('.rejection-form')?.classList.add('hidden');
      document.getElementById('rejectionReason').value = '';
  }

  updateUI() {
      const filteredReservations = this.getFilteredReservations();
      const container = this.getDashboardContainer();
      
      if (container) {
          container.innerHTML = filteredReservations
              .map(r => this.renderReservation(r))
              .join('');
      }
  }

  getFilteredReservations() {
      switch(this.currentUser.role) {
          case 'club':
              return this.reservations.filter(r => r.userId === this.currentUser.username);
          case 'adeam':
              return this.reservations.filter(r => r.status === STATUS.PENDING_ADEAM);
          case 'admin':
              return this.reservations.filter(r => r.status === STATUS.PENDING_ADMIN);
          default:
              return [];
      }
  }

  getDashboardContainer() {
      const containerId = `${this.currentUser.role}Reservations`;
      return document.getElementById(containerId);
  }

  renderReservation(reservation) {
      return `
          <div class="reservation-item" data-id="${reservation.id}" onclick="reservationManager.showDetails('${reservation.id}')">
              <div class="reservation-details">
                  <h4>${reservation.userName}</h4>
                  <p class="reservation-date">${reservation.date} • ${reservation.startTime} - ${reservation.endTime}</p>
                  <p class="reservation-room">Salle ${reservation.room}</p>
                  <p class="reservation-purpose">${reservation.objet}</p>
                  <span class="status ${STATUS_CLASSES[reservation.status]}">
                      ${STATUS_LABELS[reservation.status]}
                  </span>
              </div>
          </div>
      `;
  }

  showDetails(requestId) {
      const request = this.reservations.find(r => r.id === requestId);
      if (!request) return;

      this.currentRequestId = requestId;
      const modal = document.getElementById('requestModal');
      const content = document.getElementById('modalContent');
      
      content.innerHTML = this.renderDetailedView(request);
      modal.classList.add('active');
      
      const actionButtons = modal.querySelector('.modal-actions');
      const canAct = (this.currentUser.role === 'adeam' && request.status === STATUS.PENDING_ADEAM) ||
                    (this.currentUser.role === 'admin' && request.status === STATUS.PENDING_ADMIN);
      
      actionButtons.style.display = canAct ? 'flex' : 'none';
  }

  renderDetailedView(request) {
      return `
          <h2 class="modal-title">Détails de la Demande</h2>
          <div class="request-detail-grid">
              <div class="detail-section">
                  <h3>Informations Générales</h3>
                  <p><strong>Club:</strong> ${request.userName}</p>
                  <p><strong>Salle:</strong> ${request.room}</p>
                  <p><strong>Date:</strong> ${request.date}</p>
                  <p><strong>Horaire:</strong> ${request.startTime} - ${request.endTime}</p>
              </div>
              
              <div class="detail-section">
                  <h3>Détails de l'Événement</h3>
                  <p><strong>Type:</strong> ${request.type}</p>
                  <p><strong>Objet:</strong> ${request.objet}</p>
                  <p><strong>Participants:</strong> ${request.participantsInternes} internes, 
                                                  ${request.participantsExternes} externes</p>
              </div>
              
              <div class="detail-section">
                  <h3>Équipements Demandés</h3>
                  <ul class="equipment-list">
                      <li>Tables: ${request.equipment?.tables || 0}</li>
                      <li>Chaises: ${request.equipment?.chaises || 0}</li>
                      <li>Sonorisation: ${request.equipment?.sonorisation || 0}</li>
                      <li>Vidéoprojecteurs: ${request.equipment?.videoprojecteurs || 0}</li>
                      ${request.equipment?.autres ? `<li>Autres: ${request.equipment.autres}</li>` : ''}
                  </ul>
              </div>
              
              ${request.reason ? `
                  <div class="rejection-reason">
                      <strong>Raison du rejet:</strong> ${request.reason}
                  </div>
              ` : ''}
          </div>
      `;
  }

  showRejectionForm(requestId) {
      this.currentRequestId = requestId;
      document.querySelector('.rejection-form').classList.remove('hidden');
  }
}

const reservationManager = new ReservationManager();

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('requestModal');
  if (!modal) return;

  modal.addEventListener('click', (e) => {
      if (e.target === modal) {
          reservationManager.closeModal();
      }
  });

  document.querySelector('.modal-close')?.addEventListener('click', () => 
      reservationManager.closeModal());
  
  document.querySelector('.approve-btn')?.addEventListener('click', () => 
      reservationManager.approve(reservationManager.currentRequestId));
  
  document.querySelector('.reject-btn')?.addEventListener('click', () => 
      reservationManager.showRejectionForm(reservationManager.currentRequestId));
  
  document.querySelector('.confirm-reject-btn')?.addEventListener('click', () => {
      const reason = document.getElementById('rejectionReason').value.trim();
      if (!reason) {
          alert('Veuillez fournir une raison de rejet');
          return;
      }
      reservationManager.reject(reservationManager.currentRequestId, reason);
  });
});