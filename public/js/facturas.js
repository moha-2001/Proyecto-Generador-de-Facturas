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
            // Estilo según estado
            const estadoClass = fac.estado === 'Pagada' ? 'status-paid' : 'status-pending';
            const estadoStyle = fac.estado === 'Pagada' 
                ? 'background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px;' 
                : 'background: #ffedd5; color: #9a3412; padding: 4px 8px; border-radius: 4px;';

            // Formatear fecha
            const fecha = new Date(fac.fecha_emision).toLocaleDateString();
            const nombreArchivo = `factura-${fac.numero}.pdf`;
            const row = `
                <tr>
                    <td><strong>${fac.numero}</strong></td>
                    <td>${fac.cliente_id ? fac.cliente_id.nombre : 'Cliente Eliminado'}</td>
                    <td>${fecha}</td>
                    <td>${fac.total.toFixed(2)} €</td>
                    <td><span style="${estadoStyle}">${fac.estado}</span></td>
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