document.addEventListener('DOMContentLoaded', async () => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) window.location.href = 'index.html';

    // 1. CARGAR DATOS
    try {
        const res = await fetch(`/api/empresas/${empresaId}`);
        const data = await res.json();

        if (res.ok) {
            document.getElementById('nombreEmp').value = data.nombre || '';
            document.getElementById('emailEmp').value = data.email || '';
            document.getElementById('cifEmp').value = data.cif_nif || '';
            document.getElementById('telEmp').value = data.telefono || '';
            document.getElementById('dirEmp').value = data.direccion || '';
        }
    } catch (error) {
        console.error("Error cargando perfil:", error);
    }

    // 2. GUARDAR CAMBIOS
    document.getElementById('perfilForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const datosActualizados = {
            nombre: document.getElementById('nombreEmp').value,
            email: document.getElementById('emailEmp').value,
            cif_nif: document.getElementById('cifEmp').value,
            telefono: document.getElementById('telEmp').value,
            direccion: document.getElementById('dirEmp').value
        };

        try {
            const res = await fetch(`/api/empresas/${empresaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            });

            if (res.ok) {
                alert("✅ Perfil actualizado correctamente");
            } else {
                alert("Error al actualizar");
            }
        } catch (error) {
            alert("Error de conexión");
        }
    });
});