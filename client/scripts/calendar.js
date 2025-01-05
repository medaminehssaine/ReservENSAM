
document.addEventListener('DOMContentLoaded', function() {
    // Get reservations from localStorage
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    
    // Convert reservations to calendar events
    const events = reservations.map(reservation => {
        // Combine date with time
        const startDateTime = `${reservation.date}T${reservation.startTime}`;
        const endDateTime = `${reservation.date}T${reservation.endTime}`;
        
        return {
            id: reservation.id,
            title: reservation.objet,
            start: startDateTime,
            end: endDateTime,
            className: `status-${reservation.status}`,
            extendedProps: {
                type: reservation.type,
                room: reservation.room,
                status: reservation.status,
                user: reservation.userName,
                participantsInternes: reservation.participantsInternes,
                participantsExternes: reservation.participantsExternes,
                equipment: reservation.equipment
            }
        };
    });

    const calendarEl = document.getElementById('calendar');
    const tooltip = document.getElementById('tooltip');
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        editable: false,
        selectable: false,
        events: events,
        
        eventMouseEnter: function(info) {
            const event = info.event;
            const rect = info.el.getBoundingClientRect();
            
            const equipment = event.extendedProps.equipment || {};
            const equipmentHtml = Object.entries(equipment)
                .filter(([_, value]) => value)
                .map(([key, value]) => `${key}: ${value}`)
                .join('<br>');
            
            tooltip.innerHTML = `
                <strong>${event.title}</strong><br>
                Type: ${event.extendedProps.type}<br>
                Room: ${event.extendedProps.room}<br>
                Status: ${event.extendedProps.status}<br>
                Reserved by: ${event.extendedProps.user}<br>
                Internal Participants: ${event.extendedProps.participantsInternes}<br>
                External Participants: ${event.extendedProps.participantsExternes}<br>
                Time: ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}<br>
                ${equipmentHtml ? `<br>Equipment:<br>${equipmentHtml}` : ''}
            `;
            
            tooltip.style.display = 'block';
            tooltip.style.left = rect.left + window.scrollX + 'px';
            tooltip.style.top = rect.bottom + window.scrollY + 'px';
        },
        
        eventMouseLeave: function() {
            tooltip.style.display = 'none';
        },

        eventContent: function(info) {
            return {
                html: `
                    <div class="fc-event-main-frame">
                        <div class="fc-event-title-container">
                            <div class="fc-event-title">${info.event.title}</div>
                            <div class="fc-event-time">
                                ${info.event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </div>
                `
            };
        }
    });
    
    calendar.render();

    // Update calendar when localStorage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'reservations') {
            const updatedReservations = JSON.parse(e.newValue || '[]');
            calendar.removeAllEvents();
            calendar.addEventSource(updatedReservations.map(reservation => ({
                // ... same event mapping as above
            })));
        }
    });
});

const loginUser = async (username, password) => {
    try {
        const response = await fetch("http://localhost/ReservENSAM/server/api/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
            console.log("Login successful:", data);
        } else {
            console.error("Login failed:", data);
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

// Example usage
loginUser("exampleUsername", "examplePassword");