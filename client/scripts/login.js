function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const users = JSON.parse(localStorage.getItem('users'));

  if (users[username] && users[username].password === password) {
      const currentUser = { username, role: users[username].role };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      window.location.href = 'home.html';
  } else {
      alert('Invalid credentials');
  }
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
      login();
  }
});;