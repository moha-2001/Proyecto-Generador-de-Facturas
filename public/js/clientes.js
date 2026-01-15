document.addEventListener('DOMContentLoaded', async () => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) window.location.href = 'index.html';

    const tableBody = document.getElementById('clientesTableBody');

    try {
        // 1. Pedir clientes al backend
        const res = await fetch(`/api/clientes/${empresaId}`);
        const clientes = await res.json();

        // 2. Limpiar tabla
        tableBody.innerHTML = '';

        if (clientes.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No tienes clientes todavía. ¡Crea el primero!</td></tr>';
            return;
        }

        // 3. Dibujar filas
        clientes.forEach(cliente => {
            const row = `
                <tr>
                    <td><strong>${cliente.nombre}</strong></td>
                    <td>${cliente.cif_nif}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.telefono || '-'}</td>
                    <td>
                        <a href="#" class="action-btn-small btn-edit"><i class="fas fa-edit"></i></a>
                        <a href="#" class="action-btn-small btn-delete"><i class="fas fa-trash"></i></a>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Error:", error);
        tableBody.innerHTML = '<tr><td colspan="5" style="color:red;">Error al cargar clientes</td></tr>';
    }
});