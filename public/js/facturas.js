document.addEventListener('DOMContentLoaded', async () => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) window.location.href = 'index.html';

    const tableBody = document.getElementById('facturasTableBody');

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
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error(error);
    }
});

// ✅ FUNCIÓN GLOBAL PARA CAMBIAR EL ESTADO
// La definimos fuera del DOMContentLoaded para que el HTML pueda llamarla
window.cambiarEstado = async (facturaId, selectElement) => {
    const nuevoEstado = selectElement.value;

    // 1. Cambiar color visualmente al instante (Feedback inmediato)
    if (nuevoEstado === 'Pagada') {
        selectElement.classList.remove('status-select-pending');
        selectElement.classList.add('status-select-paid');
    } else {
        selectElement.classList.remove('status-select-paid');
        selectElement.classList.add('status-select-pending');
    }

    // 2. Avisar al Backend
    try {
        const res = await fetch(`/api/facturas/${facturaId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (res.ok) {
            // Opcional: Mostrar un toast o aviso pequeño
            console.log("Estado actualizado en BD");
        } else {
            alert("Error al actualizar estado en el servidor");
            // Revertir cambio visual si falla
            // (Aquí podrías recargar la página o volver a poner el valor anterior)
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("Error de conexión");
    }
};