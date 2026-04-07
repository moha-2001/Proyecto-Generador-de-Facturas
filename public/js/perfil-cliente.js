document.addEventListener('DOMContentLoaded', async () => {
    //  VERIFICAR SESIÓN
    const clienteId = localStorage.getItem('clienteId');
    if (!clienteId) {
        window.location.href = 'index.html';
        return;
    }

    //  BOTÓN CERRAR SESIÓN
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if(confirm("¿Seguro que quieres cerrar sesión?")) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }

    //  CARGAR DATOS 
    try {
        console.log("🔍 Pidiendo datos para ID:", clienteId);
        const res = await fetch(`/api/clientes/${clienteId}`);
        const respuesta = await res.json();
        let data = respuesta;
        if (Array.isArray(respuesta)) {
            data = respuesta.length > 0 ? respuesta[0] : null;
        } 
        else if (respuesta.cliente) {
            data = respuesta.cliente;
        }
        if (data) {
            document.getElementById('nombreCli').value = data.nombre || '';
            document.getElementById('emailCli').value  = data.email || '';
            document.getElementById('cifCli').value    = data.cif_nif || '';  
            document.getElementById('telCli').value    = data.telefono || ''; 
            document.getElementById('dirCli').value    = data.direccion || '';
            
        } 

    } catch (error) {
        console.error(" Error de conexión:", error);
    }

    //  GUARDAR DATOS (
    document.getElementById('formDatos').addEventListener('submit', async (e) => {
        e.preventDefault();

        const datosParaEnviar = {
            nombre:    document.getElementById('nombreCli').value,
            email:     document.getElementById('emailCli').value,
            cif_nif:   document.getElementById('cifCli').value,   
            telefono:  document.getElementById('telCli').value,   
            direccion: document.getElementById('dirCli').value    
        };

        try {
            const res = await fetch(`/api/clientes/${clienteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosParaEnviar)
            });

            if (res.ok) {
                alert("Datos actualizados correctamente.");
                // Actualizar nombre en caché
                localStorage.setItem('clienteNombre', datosParaEnviar.nombre);
            } else {
                alert(" Error al guardar los datos.");
            }
        } catch (error) {
            alert("Error de conexión con el servidor.");
        }
    });

    // CAMBIAR CONTRASEÑA 
    document.getElementById('formPassword').addEventListener('submit', async (e) => {
        e.preventDefault();

        const passActual = document.getElementById('passActual').value;
        const passNueva  = document.getElementById('passNueva').value;
        const passConfirm = document.getElementById('passConfirm').value;

        if (passNueva !== passConfirm) {
            alert("Las contraseñas nuevas no coinciden.");
            return;
        }

        try {
            const res = await fetch(`/api/clientes/cambiar-password-seguro/${clienteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    passwordActual: passActual, 
                    passwordNueva: passNueva 
                })
            });

            const resultado = await res.json();

            if (res.ok) {
                alert("Contraseña cambiada. Por seguridad, inicia sesión de nuevo.");
                localStorage.clear();
                window.location.href = 'index.html';
            } else {
                alert("Error: " + (resultado.error || "No se pudo cambiar la contraseña"));
            }
        } catch (error) {
            alert("Error de conexión.");
        }
    });
});