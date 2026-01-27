document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si hay usuario logueado
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) {
        window.location.href = 'index.html';
        return;
    }

    //  Cargar Estadísticas
    try {
        // Obtener Clientes
        const respClientes = await fetch(`/api/clientes/empresa/${empresaId}`);
        const clientes = await respClientes.json();
        const total = Array.isArray(clientes) ? clientes.length : 0;
        document.getElementById('totalClientes').textContent = total;

        //  Obtener Facturas
        const respFacturas = await fetch(`/api/facturas/${empresaId}`);
        const facturas = await respFacturas.json();

        if (Array.isArray(facturas)) {
            const pendientes = facturas.filter(f => f.estado === 'Pendiente').length;
            const pagadas = facturas.filter(f => f.estado === 'Pagada').length;
            document.getElementById('facturasPendientes').textContent = pendientes;
            document.getElementById('facturasPagadas').textContent = pagadas;
        }

    } catch (error) {
        console.error('Error cargando datos:', error);
    }

    // Botón Cerrar Sesión
    const btnLogout = document.getElementById('btnLogout');
    if(btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('empresaId');
            window.location.href = 'login.html';
        });
    }
});