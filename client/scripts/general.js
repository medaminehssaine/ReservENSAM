// scripts/general.js
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
