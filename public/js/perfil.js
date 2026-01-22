document.addEventListener('DOMContentLoaded', async () => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) window.location.href = 'login.html';
    const btnLogout = document.getElementById('btnLogout');
    if(btnLogout) {
        btnLogout.addEventListener('click', () => {
            if(confirm("¿Seguro que quieres salir?")) {
                localStorage.clear();
                window.location.href = 'login.html'; 
            }
        });
    }

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
                alert(" Datos actualizados correctamente");
            } else {
                alert("Error al actualizar datos");
            }
        } catch (error) {
            alert("Error de conexión");
        }
    });
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const actual = document.getElementById('passActual').value;
        const nueva = document.getElementById('passNueva').value;
        const confirm = document.getElementById('passConfirm').value;

        // Validar que coincidan
        if (nueva !== confirm) {
            alert("La nueva contraseña y la confirmación no coinciden.");
            return;
        }

        try {
            const res = await fetch(`/api/empresas/cambiar-password/${empresaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    passwordActual: actual, 
                    passwordNueva: nueva 
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert(" Contraseña cambiada con éxito.");
                // Limpiar campos de contraseña
                document.getElementById('passActual').value = '';
                document.getElementById('passNueva').value = '';
                document.getElementById('passConfirm').value = '';
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión al cambiar contraseña");
        }
    });
});