document.addEventListener('DOMContentLoaded', () => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) window.location.href = 'index.html';

    document.getElementById('crearClienteForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Recoger datos del formulario
        const nuevoCliente = {
            empresa_id: empresaId, // ¡IMPORTANTE! Vinculamos al cliente con TU empresa
            nombre: document.getElementById('nombreCli').value,
            cif_nif: document.getElementById('cifCli').value,
            email: document.getElementById('emailCli').value,
            telefono: document.getElementById('telCli').value,
            direccion: document.getElementById('dirCli').value,
            password: "dummy_password" // Ponemos una temporal porque el modelo la obliga ahora mismo
        };

        try {
            const res = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoCliente)
            });

            if (res.ok) {
                alert("✅ Cliente creado con éxito");
                // Volver a la lista de clientes
                window.location.href = 'clientes.html';
            } else {
                const data = await res.json();
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión con el servidor");
        }
    });
});