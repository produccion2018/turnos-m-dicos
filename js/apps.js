let currentUser = null;

// Función para mostrar el formulario de registro
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

// Función para mostrar el formulario de inicio de sesión
function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

// Función para registrar usuario
function register() {
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    
    if (username && password) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        users.push({ username, password });
        localStorage.setItem("users", JSON.stringify(users));

        Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: '¡Bienvenido! Ahora puedes iniciar sesión.',
        }).then(() => {
            showLogin();
        });
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos.',
        });
    }
}

// Función para iniciar sesión
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user.username;
        Swal.fire({
            icon: 'success',
            title: 'Bienvenido',
            text: `¡Hola, ${currentUser}!`,
        }).then(() => {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('appointment-form').style.display = 'block';
            generateCalendar();
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Usuario o contraseña incorrectos',
            text: 'Por favor, intenta de nuevo.',
        });
    }
}

// Función para generar el calendario
function generateCalendar() {
    const calendarContainer = document.getElementById("calendar");
    const currentMonth = new Date().getMonth();  // Obtener el mes actual
    const currentYear = new Date().getFullYear(); // Obtener el año actual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();  // Número de días en el mes actual

    let calendarHTML = "<table><thead><tr>";

    // Días de la semana
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    weekdays.forEach(day => {
        calendarHTML += `<th>${day}</th>`;
    });

    calendarHTML += "</tr></thead><tbody>";

    let dayOfMonth = 1;
    for (let week = 0; week < 6; week++) {  // Hasta 6 filas para los días
        calendarHTML += "<tr>";
        for (let day = 0; day < 7; day++) {
            if (week === 0 && day < new Date(currentYear, currentMonth, 1).getDay()) {
                // Vaciar los primeros días que no pertenecen al mes
                calendarHTML += "<td></td>";
            } else if (dayOfMonth <= daysInMonth) {
                const currentDate = `${currentYear}-${currentMonth + 1}-${dayOfMonth}`;
                const appointment = checkAppointmentAvailability(currentDate);
                const cellColor = appointment ? "red" : "green"; // rojo si no disponible, verde si disponible
                calendarHTML += `<td class="${cellColor}" onclick="selectDate('${currentDate}')">${dayOfMonth}</td>`;
                dayOfMonth++;
            }
        }
        calendarHTML += "</tr>";
        if (dayOfMonth > daysInMonth) break;
    }

    calendarHTML += "</tbody></table>";
    calendarContainer.innerHTML = calendarHTML;
}

// Función para verificar disponibilidad de turno
function checkAppointmentAvailability(date) {
    // Buscar en localStorage los turnos programados
    const appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    return appointments.some(appointment => appointment.date === date); // Si ya existe un turno para ese día, lo marca como no disponible (rojo)
}

// Función para seleccionar un día del calendario
function selectDate(date) {
    document.getElementById("appointment-date").value = date;
}

// Función para agendar turno
function bookAppointment() {
    const doctor = document.getElementById("doctor").value;
    const specialty = document.getElementById("specialty").value;
    const study = document.getElementById("medical-study").value;
    const patientName = document.getElementById("patient-name").value;
    const date = document.getElementById("appointment-date").value;
    const time = document.getElementById("appointment-time").value;

    if (doctor && specialty && patientName && date && time) {
        const appointment = {
            doctor,
            specialty,
            study: study || "N/A",
            patientName,
            date,
            time,
        };

        // Guardar en LocalStorage
        let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
        appointments.push(appointment);
        localStorage.setItem("appointments", JSON.stringify(appointments));

        Swal.fire({
            icon: 'success',
            title: 'Turno agendado',
            text: `El turno para ${patientName} ha sido agendado con éxito.`,
        }).then(() => {
            // Mostrar el turno agendado en la parte inferior
            const messageContainer = document.createElement("div");
            messageContainer.id = "appointment-message";
            messageContainer.innerHTML = `El turno para ${patientName} con el Dr. ${doctor} ha sido agendado para el ${date} a las ${time}.`;
            messageContainer.style.backgroundColor = "#4CAF50";
            messageContainer.style.color = "white";
            messageContainer.style.padding = "20px";
            messageContainer.style.fontSize = "20px";
            messageContainer.style.position = "fixed";
            messageContainer.style.bottom = "0";
            messageContainer.style.width = "100%";
            document.body.appendChild(messageContainer);

            // Eliminar el mensaje después de 5 segundos
            setTimeout(() => {
                document.getElementById("appointment-message").remove();
            }, 5000);

            // Limpiar los campos del formulario
            document.getElementById("appointment-form").reset();
            generateCalendar();  // Actualizar el calendario
        });
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa todos los campos.',
        });
    }
}
