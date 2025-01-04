async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
      const response = await fetch("http://localhost/ReservENSAM/server/api/login.php", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
          const currentUser = { username, role: data.role, token: data.token, user_id: data.user_id };
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          window.location.href = 'home.html';
      } else {
          alert(data.message);
      }
  } catch (error) {
      console.error("Error:", error);
      alert('An error occurred while logging in.');
  }
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
      login();
  }
});