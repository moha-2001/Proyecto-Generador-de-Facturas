document.addEventListener('DOMContentLoaded', async function() {
    
    // Verificar si hay usuario logueado
    let empresaId = localStorage.getItem('empresaId');
    if (empresaId == null) {
        window.location.href = 'index.html';
        return; 
    }
    // VARIABLES GLOBALES PARA EL GRÁFICO
    let listaFacturas = []; 
    let miGrafico = null;   

    // Cargar Estadísticas
    try {
        // Obtener Clientes
        let respClientes = await fetch('/api/clientes/empresa/' + empresaId);
        let clientes = await respClientes.json();
        let total = Array.isArray(clientes) ? clientes.length : 0;
        document.getElementById('totalClientes').textContent = total;
        // Llenar el desplegable de clientes para el gráfico
        let selectCliente = document.getElementById('filtroCliente');
        if (Array.isArray(clientes) && selectCliente != null) {
            for (let i = 0; i < clientes.length; i++) {
                let opcion = document.createElement('option');
                opcion.value = clientes[i]._id;
                opcion.textContent = clientes[i].nombre;
                selectCliente.appendChild(opcion);
            }
        }
        // Obtener Facturas
        let respFacturas = await fetch('/api/facturas/' + empresaId);
        listaFacturas = await respFacturas.json();
        if (!Array.isArray(listaFacturas)) {
            listaFacturas = [];
        }

        // Contamos las pendientes y pagadas
        let pendientes = 0;
        let pagadas = 0;
        for(let i = 0; i < listaFacturas.length; i++) {
            if(listaFacturas[i].estado === 'Pendiente') pendientes++;
            if(listaFacturas[i].estado === 'Pagada') pagadas++;
        }
        document.getElementById('facturasPendientes').textContent = pendientes;
        document.getElementById('facturasPagadas').textContent = pagadas;
        dibujarGrafico();

    } catch (error) {
        console.log('Error cargando datos del dashboard:', error);
    }

    // LÓGICA INTELIGENTE DEL GRÁFICO (Anual o Mensual)
    function dibujarGrafico() {
        let mesSeleccionado = document.getElementById('filtroMes').value;
        let clienteSeleccionado = document.getElementById('filtroCliente').value;

        // Variables que le pasaremos a Chart.js al final
        let etiquetasGrafico = [];
        let datosGrafico = [];

        // CASO A: VISTA ANUAL Todos los meses
        if (mesSeleccionado === "todos") {
            etiquetasGrafico = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            // Llenamos el array con 12 ceros para empezar
            for(let i = 0; i < 12; i++) {
                datosGrafico.push(0);
            }
            for (let i = 0; i < listaFacturas.length; i++) {
                let factura = listaFacturas[i];
                let fecha = new Date(factura.fecha_emision);
                let mesDeLaFactura = fecha.getMonth(); 
                // Comprobar filtro de cliente
                let idDelCliente = factura.cliente_id._id ? factura.cliente_id._id : factura.cliente_id;
                if (clienteSeleccionado !== "todos" && clienteSeleccionado !== idDelCliente) {
                    continue;
                }
                // Sumamos el total al mes correspondiente
                datosGrafico[mesDeLaFactura] = datosGrafico[mesDeLaFactura] + factura.total;
            }

        // CASO B: VISTA DIARIA Se ha seleccionado un mes concreto
        } else {
            let mesNum = parseInt(mesSeleccionado);
            let anioActual = new Date().getFullYear();            
            let diasDelMes = new Date(anioActual, mesNum + 1, 0).getDate();
            // Preparamos las etiquetas (Dia 1, Dia 2...) y llenamos los datos de ceros
            for(let i = 1; i <= diasDelMes; i++) {
                etiquetasGrafico.push(i); // Solo ponemos el numero para que quepa bien en la pantalla
                datosGrafico.push(0);
            }
            for (let i = 0; i < listaFacturas.length; i++) {
                let factura = listaFacturas[i];
                let fecha = new Date(factura.fecha_emision);
                let mesDeLaFactura = fecha.getMonth(); 
                // Si la factura no es del mes que estamos mirando, nos la saltamos
                if (mesDeLaFactura !== mesNum) {
                    continue;
                }
                // Comprobar filtro de cliente
                let idDelCliente = factura.cliente_id._id ? factura.cliente_id._id : factura.cliente_id;
                if (clienteSeleccionado !== "todos" && clienteSeleccionado !== idDelCliente) {
                    continue;
                }
                // Sacamos el dia de la factura (del 1 al 31)
                let diaDeLaFactura = fecha.getDate();
                // Como los arrays empiezan en 0, el dia 1 estara en la posicion 0
                let posicionArray = diaDeLaFactura - 1;
                datosGrafico[posicionArray] = datosGrafico[posicionArray] + factura.total;
            }
        }

        // PINTAR EL GRÁFICO 
        if (miGrafico != null) {
            miGrafico.destroy();
        }

        let ctx = document.getElementById('graficoFacturas').getContext('2d');
        miGrafico = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: etiquetasGrafico, // Aqui metemos las etiquetas calculadas
                datasets: [{
                    label: mesSeleccionado === "todos" ? 'Facturación Mensual (€)' : 'Facturación Diaria (€)',
                    data: datosGrafico,       // Aqui metemos los datos calculados
                    backgroundColor: 'rgba(99, 102, 241, 0.5)', 
                    borderColor: 'rgba(99, 102, 241, 1)',      
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, 
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // ESCUCHAR CAMBIOS EN LOS FILTROS
    let selectMes = document.getElementById('filtroMes');
    let selectFiltroCliente = document.getElementById('filtroCliente');
    if (selectMes != null) {
        selectMes.addEventListener('change', dibujarGrafico);
    }
    if (selectFiltroCliente != null) {
        selectFiltroCliente.addEventListener('change', dibujarGrafico);
    }
    // Botón Cerrar Sesión
    let botonSalir = document.getElementById('btnLogout');
    if (botonSalir != null) {
        botonSalir.addEventListener('click', function() {
            localStorage.removeItem('empresaId');
            window.location.href = 'index.html';
        });
    }
});