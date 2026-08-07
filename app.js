// Configuración
const WEBHOOK_URL = 'https://davidlealperez522.app.n8n.cloud/webhook-test/smartqueue'; // REEMPLAZAR CON TU URL REAL

// Elementos del DOM
const form = document.getElementById('turn-form');
const formContainer = document.getElementById('form-container');
const successContainer = document.getElementById('success-container');
const btnSubmit = document.getElementById('btn-submit');
const btnText = document.getElementById('btn-text');
const spinner = document.getElementById('spinner');
const btnScroll = document.getElementById('btn-scroll-form');
const btnNewTurn = document.getElementById('btn-new-turn');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Establecer fecha mínima como hoy
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.min = hoy;
});

btnScroll.addEventListener('click', () => {
    document.getElementById('booking-section').scrollIntoView({ behavior: 'smooth' });
});

btnNewTurn.addEventListener('click', () => {
    limpiarFormulario();
    successContainer.classList.add('hidden');
    formContainer.classList.remove('hidden');
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
        await enviarFormulario();
    }
});

// Funciones
function validarFormulario() {
    let isValid = true;
    
    // Obtener valores
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const servicio = document.getElementById('servicio').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const terminos = document.getElementById('terminos').checked;
    
    // Limpiar errores previos
    limpiarErrores();
    
    // Validar Nombre
    if (nombre === '') {
        mostrarError('nombre', 'El nombre es obligatorio');
        isValid = false;
    }
    
    // Validar Correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (correo === '') {
        mostrarError('correo', 'El correo es obligatorio');
        isValid = false;
    } else if (!emailRegex.test(correo)) {
        mostrarError('correo', 'Ingresa un correo electrónico válido');
        isValid = false;
    }
    
    // Validar Teléfono
    if (telefono === '') {
        mostrarError('telefono', 'El teléfono es obligatorio');
        isValid = false;
    }
    
    // Validar Servicio
    if (servicio === '') {
        mostrarError('servicio', 'Selecciona un servicio');
        isValid = false;
    }
    
    // Validar Fecha
    if (fecha === '') {
        mostrarError('fecha', 'La fecha es obligatoria');
        isValid = false;
    } else {
        const hoy = new Date().toISOString().split('T')[0];
        if (fecha < hoy) {
            mostrarError('fecha', 'La fecha no puede ser anterior a hoy');
            isValid = false;
        }
    }
    
    // Validar Hora
    if (hora === '') {
        mostrarError('hora', 'La hora es obligatoria');
        isValid = false;
    }
    
    // Validar Términos
    if (!terminos) {
        mostrarError('terminos', 'Debes aceptar los términos y condiciones');
        isValid = false;
    }
    
    return isValid;
}

function mostrarError(campoId, mensaje) {
    const input = document.getElementById(campoId);
    const errorSpan = document.getElementById(`error-${campoId}`);
    
    input.classList.add('input-error');
    errorSpan.textContent = mensaje;
}

function limpiarErrores() {
    const inputs = form.querySelectorAll('input, select');
    const errorSpans = form.querySelectorAll('.error-message');
    
    inputs.forEach(input => input.classList.remove('input-error'));
    errorSpans.forEach(span => span.textContent = '');
}

function mostrarSpinner(mostrar) {
    if (mostrar) {
        btnSubmit.disabled = true;
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
    } else {
        btnSubmit.disabled = false;
        btnText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

function generarCodigoTurno() {
    const anio = new Date().getFullYear();
    const numeroAleatorio = Math.floor(Math.random() * 9000) + 1000;
    return `SQ-${anio}-${numeroAleatorio}`;
}

async function enviarFormulario() {
    mostrarSpinner(true);
    
    const formData = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        telefono: document.getElementById('telefono').value,
        servicio: document.getElementById('servicio').value,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        tipoAtencion: document.querySelector('input[name="tipoAtencion"]:checked').value,
        observaciones: document.getElementById('observaciones').value,
        turnoId: generarCodigoTurno(),
        timestamp: new Date().toISOString()
    };
    
    try {
        if (WEBHOOK_URL.includes('ejemplo.com')) {
            // Simulación para pruebas si el usuario aún no ha cambiado la URL por la de n8n
            await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
            // Envío real a n8n
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
        }
        
        mostrarConfirmacion(formData);
        actualizarEstadisticas();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al solicitar el turno. Por favor, intenta de nuevo o verifica la URL del Webhook.');
    } finally {
        mostrarSpinner(false);
    }
}

function mostrarConfirmacion(datos) {
    // Ocultar formulario
    formContainer.classList.add('hidden');
    
    // Llenar datos en el ticket
    document.getElementById('ticket-number').textContent = datos.turnoId;
    document.getElementById('ticket-service').textContent = datos.servicio;
    
    // Formatear fecha para display
    const fechaObj = new Date(datos.fecha + 'T00:00:00');
    const opcionesFecha = { day: 'numeric', month: 'short', year: 'numeric' };
    document.getElementById('ticket-date').textContent = fechaObj.toLocaleDateString('es-ES', opcionesFecha);
    
    document.getElementById('ticket-time').textContent = datos.hora;
    document.getElementById('ticket-type').textContent = datos.tipoAtencion;
    
    // Mostrar estado de éxito
    successContainer.classList.remove('hidden');
}

function limpiarFormulario() {
    form.reset();
    limpiarErrores();
    // Restablecer radio button por defecto
    document.querySelector('input[value="Normal"]').checked = true;
}

function actualizarEstadisticas() {
    // Simular un incremento en las estadísticas del dashboard lateral
    const statToday = document.getElementById('stat-today');
    const statPending = document.getElementById('stat-pending');
    const statAttended = document.getElementById('stat-attended');
    
    const currentToday = parseInt(statToday.textContent.replace(/,/g, ''));
    const currentPending = parseInt(statPending.textContent.replace(/,/g, ''));
    const currentAttended = parseInt(statAttended.textContent.replace(/,/g, ''));
    
    statToday.textContent = (currentToday + 1).toLocaleString();
    statPending.textContent = (currentPending + 1).toLocaleString();
    statAttended.textContent = (currentAttended + 1).toLocaleString();
}