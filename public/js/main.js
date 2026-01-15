document.getElementById('registroForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // 1. Coger los datos del HTML
    const datos = {
        nombre: document.getElementById('nombre').value,
        cif_nif: document.getElementById('cif').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        password: document.getElementById('password').value
    };

    // Validación básica de contraseña
    const confirm = document.getElementById('confirmPassword').value;
    if (datos.password !== confirm) {
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        // 2. Enviar al Backend (Fetch API)
        const respuesta = await fetch('/api/empresas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            alert('¡Registro exitoso! Guardando ID...');
            // Guardamos el ID de la empresa en el navegador para usarlo luego
            localStorage.setItem('empresaId', resultado.empresa._id);
            // Redirigir al Dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Error: ' + resultado.error);
        }

    } catch (error) {
        console.error("Error de red:", error);
        alert('Error al conectar con el servidor');
    }
});