const users = {
  'club1': { password: 'club123', role: 'club' },
  'adeam': { password: 'adeam123', role: 'adeam' },
  'admin': { password: 'admin123', role: 'admin' }
};

// Store reservations
let reservations = [];
let currentUser = null;

function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (users[username] && users[username].password === password) {
      currentUser = { username, role: users[username].role };
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('logoutBtn').classList.remove('hidden');

      // Show appropriate dashboard
      switch(users[username].role) {
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
  } else {
      alert('Invalid credentials');
  }
}

function logout() {
  currentUser = null;
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('logoutBtn').classList.add('hidden');
  document.getElementById('clubDashboard').classList.add('hidden');
  document.getElementById('adeamDashboard').classList.add('hidden');
  document.getElementById('adminDashboard').classList.add('hidden');
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}

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
  updateDashboard();
  clearForm();
}

function clearForm() {
  document.getElementById('room').value = 'room1';
  document.getElementById('date').value = '';
  document.getElementById('time').value = '';
  document.getElementById('purpose').value = '';
}

function updateStatus(id, status) {
  const reservation = reservations.find(r => r.id === id);
  if (reservation) {
      reservation.status = status;
      updateDashboard();
  }
}

function updateDashboard() {
  if (!currentUser) return;

  switch(currentUser.role) {
      case 'club':
          const clubReservations = reservations.filter(r => r.club === currentUser.username);
          document.getElementById('clubReservations').innerHTML = clubReservations.map(renderReservation).join('');
          break;
      case 'adeam':
          const adeamReservations = reservations.filter(r => r.status === 'pending_adeam');
          document.getElementById('adeamReservations').innerHTML = adeamReservations.map(r => renderReservation(r, true)).join('');
          break;
      case 'admin':
          const adminReservations = reservations.filter(r => r.status === 'pending_admin');
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
              <div>
                  <button onclick="updateStatus(${reservation.id}, 'pending_admin')" style="width: auto; margin-right: 0.5rem;">Approve</button>
                  <button onclick="updateStatus(${reservation.id}, 'rejected')" style="width: auto; background-color: var(--danger);">Reject</button>
              </div>
          `;
      } else if (currentUser.role === 'admin' && reservation.status === 'pending_admin') {
          actions = `
              <div>
                  <button onclick="updateStatus(${reservation.id}, 'approved')" style="width: auto; margin-right: 0.5rem;">Approve</button>
                  <button onclick="updateStatus(${reservation.id}, 'rejected')" style="width: auto; background-color: var(--danger);">Reject</button>
              </div>
          `;
      }
  }

  return `
      <div class="reservation-item">
          <div>
              <h4>Room ${reservation.room}</h4>
              <p>${reservation.date} at ${reservation.time}</p>
              <p>${reservation.purpose}</p>
              <span class="status ${statusClasses[reservation.status]}">${statusText[reservation.status]}</span>
          </div>
          ${actions}
      </div>
  `;
}