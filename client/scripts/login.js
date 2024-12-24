function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (users[username] && users[username].password === password) {
    currentUser = { username, role: users[username].role };
    window.location.href = 'home.html';
  } else {
    alert('Invalid credentials');
  }
}