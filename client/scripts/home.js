// scripts/home.js
const STATUS = {
    PENDING_ADEAM: 'PENDING_ADEAM',
    PENDING_ADMIN: 'PENDING_ADMIN',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};
  
const STATUS_LABELS = {
    'PENDING_ADEAM': 'En attente de l\'ADEAM',
    'PENDING_ADMIN': 'En attente de l\'ADMIN',
    'APPROVED': 'Approuvé',
    'REJECTED': 'Rejeté'
};
  
const STATUS_CLASSES = {
    [STATUS.PENDING_ADEAM]: 'status-pending',
    [STATUS.PENDING_ADMIN]: 'status-pending',
    [STATUS.APPROVED]: 'status-approved',
    [STATUS.REJECTED]: 'status-rejected'
};

let selectedDates = []; // Define selectedDates at the top

document.addEventListener('DOMContentLoaded', async () => {
    // Retrieve current user
    const currentUser = await checkAuth();

    // Show appropriate dashboard
    const dashboardId = `${currentUser.role.toLowerCase()}Dashboard`;
    const dashboard = document.getElementById(dashboardId);
    if (dashboard) {
        dashboard.classList.remove('hidden');
    }

    // Initialize flatpickr for date selection
    flatpickr("#multiple-dates", {
        mode: "multiple",
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: dates => {
            selectedDates = dates.map(date => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            });
        }
    });

    loadReservations();
});

function approveReservation(button) {
    const reservationItem = button.closest('.reservation-item');
    const reservationId = reservationItem.dataset.id;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    fetch('http://localhost/ReservENSAM/server/api/approve_reservation.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
            id: reservationId,
            user_id: currentUser.user_id,
            user_role: currentUser.role
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            reservationItem.remove();
        } else {
            alert(data.message);
        }
    });
}

function rejectReservation(button) {
    const reservationItem = button.closest('.reservation-item');
    const reservationId = reservationItem.dataset.id;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const reason = prompt('Raison du rejet:');
    if (!reason) return;

    fetch('http://localhost/ReservENSAM/server/api/reject_reservation.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
            id: reservationId,
            reason: reason,
            user_id: currentUser.user_id,
            user_role: currentUser.role
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            reservationItem.remove();
        }
    });
}

async function loadReservations() {
    const response = await fetch('http://localhost/ReservENSAM/server/api/get_reservations.php', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    
    const reservations = await response.json();
    displayReservations(reservations);
}

function displayReservations(reservations) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const container = document.getElementById(`${currentUser.role.toLowerCase()}Reservations`);
    
    let filteredReservations = reservations;
    if (currentUser.role === 'CLUB') {
        filteredReservations = reservations.filter(reservation => parseInt(reservation.club_id) === currentUser.user_id);
        filteredReservations.reverse();
    } else if (currentUser.role === 'ADEAM') {
        filteredReservations = reservations.filter(reservation => reservation.status === 'PENDING_ADEAM');
    } else if (currentUser.role === 'ADMIN') {
        filteredReservations = reservations.filter(reservation => reservation.status === 'PENDING_ADMIN');
    }

    container.innerHTML = filteredReservations.map(reservation => {
        const equipment = JSON.parse(reservation.required_equipment);
        let downloadButton = '';
        if (reservation.status === 'APPROVED') {
            downloadButton = `
                <button onclick="downloadPdf(${reservation.id})" class="action-button download-button">
                    Télécharger PDF
                </button>
            `;
        }

        return `
            <div class="reservation-item" data-id="${reservation.id}">
                <div class="reservation-details">
                    ${currentUser.role !== 'CLUB' ? `<p><strong>Club:</strong> ${reservation.club_name}</p>` : ''}
                    <p><strong>Objet de l'événement:</strong> ${reservation.activity_description}</p>
                    <p><strong>Type d'événement:</strong> ${reservation.event_type}</p>
                    <p><strong>Date de réservation:</strong> ${reservation.start_date.split(' ')[0]}</p>
                    <p><strong>Heures:</strong> ${reservation.start_time.slice(0, 5)} à ${reservation.end_time.slice(0, 5)}</p>
                    <p><strong>Salle:</strong> ${reservation.room_name}</p>
                    <p><strong>Participants internes:</strong> ${reservation.internal_attendees}</p>
                    <p><strong>Participants externes:</strong> ${reservation.external_attendees}</p>
                    <p><strong>Équipements requis:</strong> Tables: ${equipment.tables}, Chaises: ${equipment.chaises}, Sonorisation: ${equipment.sonorisation}, Vidéoprojecteurs: ${equipment.videoprojecteurs}, Autres: ${equipment.autres}</p>
                    <p><strong>Status:</strong> <span class="status ${reservation.status.toLowerCase()}">${STATUS_LABELS[reservation.status]}</span></p>
                    ${reservation.status === 'REJECTED' ? `<p><strong>Raison du rejet:</strong> ${reservation.rejection_reason}</p>` : ''}
                </div>
                <div class="reservation-actions">
                    ${downloadButton}
                    ${currentUser.role === 'CLUB' ? `
                        ${reservation.status === 'REJECTED' ? `
                            <button onclick="deleteRejectedReservation(this)" class="action-button danger-btn">
                                Supprimer
                            </button>
                        ` : reservation.status !== 'APPROVED' ? `
                            <button onclick="cancelReservation(this)" class="action-button cancel-button">
                                Annuler
                            </button>
                        ` : ''}
                    ` : currentUser.role !== 'CLUB' ? `
                        <button onclick="approveReservation(this)" class="action-button accept-button">
                            Approuver
                        </button>
                        <button onclick="rejectReservation(this)" class="action-button reject-button">
                            Rejeter
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function downloadPdf(reservationId) {
    try {
        // Get reservation data
        const response = await fetch('http://localhost/ReservENSAM/server/api/get_reservations.php', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const reservations = await response.json();
        const reservation = reservations.find(r => r.id === reservationId);

        if (!reservation) {
            throw new Error('Reservation not found');
        }

        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set font
        doc.setFont("helvetica");

        // Add title
        doc.setFontSize(20);
        doc.text('Confirmation de Réservation - ENSAM', 105, 20, { align: 'center' });
        
        // Add content
        doc.setFontSize(12);
        let y = 40;
        const equipment = JSON.parse(reservation.required_equipment);

        // Add reservation details
        const details = [
            { label: 'Club:', value: reservation.club_name },
            { label: 'Date:', value: reservation.start_date.split(' ')[0] },
            { label: 'Horaire:', value: `${reservation.start_time.slice(0, 5)} à ${reservation.end_time.slice(0, 5)}` },
            { label: 'Salle:', value: reservation.room_name },
            { label: "Type d'événement:", value: reservation.event_type },
            { label: "Description:", value: reservation.activity_description },
            { label: 'Participants:', value: `${reservation.internal_attendees} internes, ${reservation.external_attendees} externes` },
            { label: 'Équipements:', value: '' }
        ];

        details.forEach(detail => {
            doc.text(`${detail.label} ${detail.value}`, 20, y);
            y += 10;
        });

        // Add equipment details
        y += 5;
        Object.entries(equipment).forEach(([key, value]) => {
            if (value) {
                doc.text(`- ${key}: ${value}`, 30, y);
                y += 10;
            }
        });

        // Add footer
        doc.setFontSize(10);
        doc.text('Document généré automatiquement', 105, 280, { align: 'center' });

        // Save PDF
        doc.save(`reservation-${reservationId}.pdf`);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('Erreur lors de la génération du PDF');
    }
}

// Add this new function
function deleteRejectedReservation(button) {
    const reservationItem = button.closest('.reservation-item');
    const reservationId = reservationItem.dataset.id;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (confirm('Voulez-vous supprimer définitivement cette réservation rejetée?')) {
        fetch('http://localhost/ReservENSAM/server/api/cancel_reservation.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
                id: reservationId,
                user_id: currentUser.user_id
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                reservationItem.remove();
            } else {
                alert('Failed to delete reservation');
            }
        });
    }
}

function submitReservation() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const activityDescription = document.getElementById('objet').value;
    const internalAttendees = document.getElementById('participants-internes').value;
    const externalAttendees = document.getElementById('participants-externes').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const room = document.getElementById('room').value;
    const eventType = document.getElementById('type').value; // Add this line

    if (!activityDescription || !internalAttendees || !externalAttendees || selectedDates.length === 0 || !startTime || !endTime || !room) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }

    const reservationData = {
        club_id: currentUser.user_id,
        activity_description: activityDescription,
        event_type: eventType, // Add this line
        internal_attendees: internalAttendees,
        external_attendees: externalAttendees,
        dates: selectedDates,
        start_time: startTime,
        end_time: endTime,
        room: parseInt(document.getElementById('room').value, 10),
        required_equipment: {
            tables: document.getElementById('tables').value,
            chaises: document.getElementById('chaises').value, // Add this line
            sonorisation: document.getElementById('sonorisation').value, // Add this line
            videoprojecteurs: document.getElementById('videoprojecteurs').value,
            autres: document.getElementById('autres').value
        }
    };

    fetch('http://localhost/ReservENSAM/server/api/submit_reservation.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reservationData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Reservation submitted successfully');
            loadReservations();
        } else {
            alert('Failed to submit reservation');
        }
    });
}

function cancelReservation(button) {
    const reservationItem = button.closest('.reservation-item');
    const reservationId = reservationItem.dataset.id;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    fetch('http://localhost/ReservENSAM/server/api/cancel_reservation.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
            id: reservationId,
            user_id: currentUser.user_id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            reservationItem.remove();
        } else {
            alert('Failed to cancel reservation');
        }
    });
}