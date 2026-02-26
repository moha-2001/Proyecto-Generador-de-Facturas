document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si tenemos el ID de la empresa
    const empresaId = localStorage.getItem('empresaId');
    console.log("🔍 ID de Empresa detectado:", empresaId);

    if (!empresaId) {
        alert("Error: No hay sesión de empresa iniciada.");
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('crearClienteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log(" Intentando enviar formulario...");

        // 2. Verificar los datos antes de enviar
        const cifInput = document.getElementById('cifCli');
        const nombreInput = document.getElementById('nombreCli');
        const emailInput = document.getElementById('emailCli');
        
        // Debug: ver si encuentra los inputs
        if (!cifInput || !nombreInput || !emailInput) {
            console.error(" ERROR HTML: No encuentro los inputs por su ID. Revisa el HTML.");
            alert("Error interno: Faltan IDs en el HTML");
            return;
        }

        const cifNifValue = cifInput.value;

        const nuevoCliente = {
            empresa_id: empresaId,
            nombre: nombreInput.value,
            cif_nif: cifNifValue,
            email: emailInput.value,
            telefono: document.getElementById('telCli').value,
            direccion: document.getElementById('dirCli').value,
            password: cifNifValue // La contraseña es el CIF
        };

        console.log(" Datos preparados para enviar:", nuevoCliente);

        try {
            const res = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoCliente)
            });

            console.log(" Respuesta del servidor (Status):", res.status);

            const data = await res.json();
            console.log(" Datos devueltos por servidor:", data);

            if (res.ok) {
                alert("Cliente creado con éxito.\nContraseña: " + cifNifValue);
                window.location.href = 'clientes.html';
            } else {
                // Aquí veremos por qué falla
                alert(" Error del Servidor: " + (data.error || JSON.stringify(data)));
            }
        } catch (error) {
            console.error(" Error de Red/Código:", error);
            alert("Error grave: Mira la consola (F12)");
        }
    });
});