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

// Add modal system
function showModal({ title, message, inputType = 'text', confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm, placeholder = '' }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const content = `
        <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
        </div>
        <div class="modal-body">
            ${inputType === 'text' ? 
                `<textarea placeholder="${placeholder}" class="modal-input"></textarea>` :
                `<p>${message}</p>`
            }
        </div>
        <div class="modal-footer">
            <button class="modal-button modal-cancel">${cancelText}</button>
            <button class="modal-button modal-confirm">${confirmText}</button>
        </div>
    `;

    modal.innerHTML = content;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    return new Promise((resolve) => {
        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            const input = modal.querySelector('.modal-input');
            const value = input ? input.value : true;
            overlay.remove();
            resolve(value);
        });

        modal.querySelector('.modal-cancel').addEventListener('click', () => {
            overlay.remove();
            resolve(null);
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(null);
            }
        });
    });
}

// Replace window.confirm and window.prompt
window.confirm = function(message) {
    return showModal({
        title: 'Confirmation',
        message: message,
        inputType: 'message'
    });
};

window.prompt = function(message, defaultValue = '') {
    return showModal({
        title: message,
        inputType: 'text',
        placeholder: defaultValue
    });
};
