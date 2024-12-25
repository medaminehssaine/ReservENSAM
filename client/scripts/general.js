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