// Login function: Check username and password
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (users[username] && users[username].password === password) {
    currentUser = { username, role: users[username].role };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    window.location.href = 'home.html';
  } else {
    alert('Invalid credentials');
  }
}

// Call login after clicking Enter key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
      login();
  }
});