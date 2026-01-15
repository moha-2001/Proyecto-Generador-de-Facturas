document.addEventListener('DOMContentLoaded', async () => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) window.location.href = 'index.html';

    const tableBody = document.getElementById('clientesTableBody');

    // Función para cargar la tabla
    async function cargarClientes() {
        try {
            const res = await fetch(`/api/clientes/${empresaId}`);
            const clientes = await res.json();

            tableBody.innerHTML = '';

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
                    const id = e.target.closest('button').dataset.id;
                    confirmarBorrado(id);
                });
            });

        } catch (error) {
            console.error("Error:", error);
        }
    }

    // Lógica de Borrado
    window.confirmarBorrado = async (id) => {
        if (confirm("¿Estás seguro de que quieres eliminar a este cliente? Se borrarán sus datos de acceso.")) {
            try {
                const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    alert("Cliente eliminado");
                    cargarClientes(); // Recargar tabla
                } else {
                    alert("Error al eliminar");
                }
            } catch (error) {
                alert("Error de conexión");
            }
        }
    };

    cargarClientes();
});