const users = {
  'club1': { password: 'club123', role: 'club' },
  'adeam': { password: 'adeam123', role: 'adeam' },
  'admin': { password: 'admin123', role: 'admin' }
};

let currentUser = null;
let reservations = [];

function logout() {
  currentUser = null;
  window.location.href = 'login.html';
}

function checkAuth() {
  if (!currentUser) {
    window.location.href = 'login.html';
  }
}