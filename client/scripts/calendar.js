document.addEventListener('DOMContentLoaded', async () => {
    // Retrieve current user
    const currentUser = await checkAuth();

    // Fetch approved reservations from the backend
    const response = await fetch('http://localhost/ReservENSAM/server/api/get_reservations.php', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const reservations = await response.json();

    // Filter approved reservations
    const approvedReservations = reservations.filter(reservation => reservation.status === 'APPROVED');

    // Convert reservations to calendar events
    const events = approvedReservations.map(reservation => {
        const startDateTime = `${reservation.start_date}`;
        const endDateTime = `${reservation.end_date}`;
        
        return {
            id: reservation.id,
            title: `${reservation.club_name} - ${reservation.room_name}`,
            start: startDateTime,
            end: endDateTime,
            className: `status-${reservation.status.toLowerCase()}`,
            extendedProps: {
                objet: reservation.activity_description,
                type: reservation.event_type,
                room: reservation.room_name,
                participantsInternes: reservation.internal_attendees,
                participantsExternes: reservation.external_attendees,
                equipment: JSON.parse(reservation.required_equipment)
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
                Objet de l'événement: ${event.extendedProps.objet}<br>
                Type: ${event.extendedProps.type}<br>
                Participants internes: ${event.extendedProps.participantsInternes}<br>
                Participants externes: ${event.extendedProps.participantsExternes}<br>
                ${equipmentHtml ? `<br>Équipements:<br>${equipmentHtml}` : ''}
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
                                ${info.event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${info.event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </div>
                `
            };
        }
    });
    
    calendar.render();
});
