document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener el ID de la URL (ej: editar-cliente.html?id=ABC)
    const params = new URLSearchParams(window.location.search);
    const clienteId = params.get('id');

    // Validación: Si no hay ID, volvemos a la lista
    if (!clienteId) {
        alert("Error: No se especificó un cliente para editar.");
        window.location.href = 'clientes.html';
        return;
    }

    // 2. Cargar datos actuales del cliente (GET)
    try {
        console.log("Cargando datos del cliente ID:", clienteId);

        // ✅ USAMOS LA RUTA CORRECTA "/detalle/"
        const res = await fetch(`/api/clientes/detalle/${clienteId}`);
        
        if (!res.ok) {
            throw new Error("Error al obtener datos del servidor");
        }

        const cliente = await res.json();
        console.log("Datos recibidos:", cliente); // Para depurar

        // Rellenar el formulario con los datos recibidos
        // Usamos || '' para que no escriba "undefined" si el campo está vacío
        document.getElementById('clienteId').value = cliente._id;
        document.getElementById('nombreCli').value = cliente.nombre || '';
        document.getElementById('cifCli').value = cliente.cif_nif || '';
        document.getElementById('emailCli').value = cliente.email || '';
        document.getElementById('telCli').value = cliente.telefono || '';
        document.getElementById('dirCli').value = cliente.direccion || '';

    } catch (error) {
        console.error("Error grave cargando cliente:", error);
        alert("No se pudieron cargar los datos del cliente.");
        window.location.href = 'clientes.html'; // Volver si falla
    }

    // 3. Guardar cambios (PUT)
    document.getElementById('editarClienteForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Recogemos los datos del formulario
        const datosActualizados = {
            nombre: document.getElementById('nombreCli').value,
            cif_nif: document.getElementById('cifCli').value,
            email: document.getElementById('emailCli').value,
            telefono: document.getElementById('telCli').value,
            direccion: document.getElementById('dirCli').value
        };

        try {
            console.log("Enviando actualización...", datosActualizados);

            // La ruta PUT suele ser directa con el ID (sin /detalle/)
            const res = await fetch(`/api/clientes/${clienteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            });

            if (res.ok) {
                alert("✅ Cliente actualizado correctamente");
                window.location.href = 'clientes.html'; // Volver a la lista
            } else {
                const errorData = await res.json();
                alert("Error al actualizar: " + (errorData.error || "Desconocido"));
            }
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error de conexión con el servidor");
        }
    });
});