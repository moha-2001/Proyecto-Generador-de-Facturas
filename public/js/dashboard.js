document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si hay usuario logueado
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) {
        window.location.href = 'index.html'; // Si no hay ID, mandar al login
        return;
    }

    // 2. Cargar Estadísticas
    try {
        // A) Obtener Clientes
        const respClientes = await fetch(`/api/clientes/${empresaId}`);
        const clientes = await respClientes.json();
        document.getElementById('totalClientes').textContent = clientes.length || 0;

        // B) Obtener Facturas
        const respFacturas = await fetch(`/api/facturas/${empresaId}`);
        const facturas = await respFacturas.json();

        // Calcular pendientes vs pagadas
        const pendientes = facturas.filter(f => f.estado === 'Pendiente').length;
        const pagadas = facturas.filter(f => f.estado === 'Pagada').length;

        document.getElementById('facturasPendientes').textContent = pendientes;
        document.getElementById('facturasPagadas').textContent = pagadas;

    } catch (error) {
        console.error('Error cargando datos:', error);
    }

    // 3. Botón Cerrar Sesión
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('empresaId');
        window.location.href = 'index.html';
    });
});