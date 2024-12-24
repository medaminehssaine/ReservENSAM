const users = {
  'club1': { password: 'club123', role: 'club' },
  'adeam': { password: 'adeam123', role: 'adeam' },
  'admin': { password: 'admin123', role: 'admin' }
};
localStorage.setItem("users", JSON.stringify(users));

let reservations = [];

// Logout function
function logout() {
  localStorage.setItem("currentUser", JSON.stringify(null));
  window.location.href = 'login.html';
}

// Check Authentication function
function checkAuth(currentUser) {
  if (!currentUser) {
    window.location.href = 'login.html';
  }
}