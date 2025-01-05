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

// Add this toast notification system
function showToast(message, type = 'success') {
    // Create container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Add to container
    container.appendChild(toast);

    // Remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Replace all alerts with this new function
window.alert = function(message) {
    showToast(message);
};
