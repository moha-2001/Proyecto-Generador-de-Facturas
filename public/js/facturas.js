document.addEventListener('DOMContentLoaded', async () => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) window.location.href = 'index.html';

    const tableBody = document.getElementById('facturasTableBody');
    
    // Botón Cerrar Sesión
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('empresaId');
            window.location.href = 'login.html';
        });
    }

    try {
        const res = await fetch(`/api/facturas/${empresaId}`);
        const facturas = await res.json();

        tableBody.innerHTML = '';
        if (facturas.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay facturas creadas.</td></tr>';
            return;
        }

        facturas.forEach(fac => {
            const fecha = new Date(fac.fecha_emision).toLocaleDateString();
            const nombreArchivo = `factura-${fac.numero}.pdf`;

            // Determinamos qué opción debe estar seleccionada
            const isPendiente = fac.estado === 'Pendiente' ? 'selected' : '';
            const isPagada = fac.estado === 'Pagada' ? 'selected' : '';
            
            // Color inicial del select
            const colorClass = fac.estado === 'Pagada' ? 'status-select-paid' : 'status-select-pending';
            
            const row = `
                <tr>
                    <td><strong>${fac.numero}</strong></td>
                    <td>${fac.cliente_id ? fac.cliente_id.nombre : 'Cliente Eliminado'}</td>
                    <td>${fecha}</td>
                    <td>${fac.total.toFixed(2)} €</td>
                    <td>
                        <select class="status-select ${colorClass}" onchange="cambiarEstado('${fac._id}', this)">
                            <option value="Pendiente" ${isPendiente}>Pendiente</option>
                            <option value="Pagada" ${isPagada}>Pagada</option>
                        </select>
                    </td>
                    <td>
                        <a href="/facturas/${nombreArchivo}" target="_blank" class="action-btn-small" style="background:#6c63ff; padding: 6px 10px;">
                            <i class="fas fa-eye"></i>
                        </a>
                        
                        <a href="/facturas/${nombreArchivo}" download class="action-btn-small" style="background:#666; padding: 6px 10px;">
                            <i class="fas fa-download"></i>
                        </a>

                        <button class="action-btn-small" style="background:#ef4444; padding: 6px 10px; border:none; cursor:pointer; color:white; margin-left:5px;" onclick="eliminarFactura('${fac._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error(error);
    }
});

// Función para cambiar estado (Pendiente <-> Pagada)
window.cambiarEstado = async (facturaId, selectElement) => {
    const nuevoEstado = selectElement.value;
    if (nuevoEstado === 'Pagada') {
        selectElement.classList.remove('status-select-pending');
        selectElement.classList.add('status-select-paid');
    } else {
        selectElement.classList.remove('status-select-paid');
        selectElement.classList.add('status-select-pending');
    }

    try {
        const res = await fetch(`/api/facturas/${facturaId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (res.ok) {
            console.log("Estado actualizado en BD");
        } else {
            alert("Error al actualizar estado en el servidor");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Error de conexión");
    }
};

// NUEVA FUNCIÓN: ELIMINAR FACTURA
window.eliminarFactura = async (id) => {
    // 1. Preguntar confirmación
    if (!confirm("⚠️ ¿Estás seguro de que quieres eliminar esta factura permanentemente?")) {
        return;
    }

    try {
        // 2. Llamar al backend
        const res = await fetch(`/api/facturas/${id}`, { method: 'DELETE' });

        if (res.ok) {
            alert("Factura eliminada");
            // 3. Recargar la página para ver los cambios
            location.reload(); 
        } else {
            const data = await res.json();
            alert("Error al eliminar: " + (data.error || "Desconocido"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión al intentar borrar.");
    }
};