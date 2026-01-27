document.addEventListener('DOMContentLoaded', async () => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) window.location.href = 'index.html';

    const tableBody = document.getElementById('clientesTableBody');

    // Función para cargar la tabla
    async function cargarClientes() {
        try {
            // 👇👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE 👇👇
            // Antes era: /api/clientes/${empresaId}
            // AHORA ES:  /api/clientes/empresa/${empresaId}
            const res = await fetch(`/api/clientes/empresa/${empresaId}`);
            
            const clientes = await res.json();

            tableBody.innerHTML = '';

            // Si devuelve error o no es un array, lo manejamos
            if (!Array.isArray(clientes)) {
                console.error("Respuesta inesperada:", clientes);
                return;
            }

            if (clientes.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No tienes clientes.</td></tr>';
                return;
            }

            clientes.forEach(cliente => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${cliente.nombre}</strong></td>
                    <td>${cliente.cif_nif}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.telefono || '-'}</td>
                    <td>
                        <button class="action-btn-small btn-edit" onclick="location.href='editar-cliente.html?id=${cliente._id}'">
                            <i class="fas fa-edit"></i>
                        </button>
                        
                        <button class="action-btn-small btn-delete" data-id="${cliente._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Asignar eventos a los botones de borrar
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Usamos closest para asegurar que pillamos el botón aunque clickemos en el icono
                    const btnElement = e.target.closest('button');
                    if (btnElement) {
                        const id = btnElement.dataset.id;
                        confirmarBorrado(id);
                    }
                });
            });

        } catch (error) {
            console.error("Error:", error);
        }
    }

    // Lógica de Borrado (Esta se queda igual porque usa DELETE, no choca con GET)
    window.confirmarBorrado = async (id) => {
        if (confirm("¿Estás seguro de que quieres eliminar a este cliente? Se borrarán sus datos de acceso.")) {
            try {
                // DELETE /api/clientes/:id funciona bien
                const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    alert("Cliente eliminado");
                    cargarClientes(); 
                } else {
                    alert("Error al eliminar");
                }
            } catch (error) {
                alert("Error de conexión");
            }
        }
    };

    cargarClientes();
    
    // 3. Botón Cerrar Sesión
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('empresaId');
            window.location.href = 'login.html';
        });
    }
});