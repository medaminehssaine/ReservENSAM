async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showToast('Veuillez remplir tous les champs', 'error');
        return;
    }

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
            showToast('Connexion réussie', 'success');
            setTimeout(() => window.location.href = 'home.html', 1500);
        } else {
            const errorMessage = data.message || 'Identifiants incorrects';
            showToast(errorMessage, 'error');
            document.getElementById('password').value = ''; // Clear password field
        }
    } catch (error) {
        console.error("Error:", error);
        showToast('Erreur de connexion au serveur', 'error');
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        login();
    }
});