document.addEventListener('DOMContentLoaded', async () => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) window.location.href = 'index.html';

    // CARGAR CLIENTES EN EL SELECT (CORREGIDO)
    const clienteSelect = document.getElementById('clienteSelect');
    try {
        // 👇👇 AQUÍ ESTÁ EL CAMBIO CLAVE: AÑADIMOS "/empresa/" 👇👇
        const res = await fetch(`/api/clientes/empresa/${empresaId}`);
        const clientes = await res.json();
        
        // Verificación de seguridad por si el servidor devuelve un error
        if (Array.isArray(clientes)) {
            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente._id; // El ID de Mongo
                option.textContent = cliente.nombre;
                clienteSelect.appendChild(option);
            });
        } else {
            console.error("La respuesta del servidor no es una lista de clientes:", clientes);
        }

    } catch (error) {
        console.error("Error cargando clientes:", error);
    }
    // Poner fechas por defecto
    const fechaInput = document.getElementById('fechaEmision');
    if(fechaInput) fechaInput.valueAsDate = new Date();

    //  LÓGICA DE FILAS Y PRODUCTOS
    const itemsContainer = document.getElementById('itemsContainer');
    const btnAgregar = document.getElementById('btnAgregarItem');

    // Función para crear una fila nueva
    function agregarFila() {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" class="desc" placeholder="Concepto del servicio" required></td>
            <td><input type="number" class="cant" value="1" min="1" required></td>
            <td><input type="number" class="precio" value="0" min="0" step="0.01" required></td>
            <td class="subtotal-fila">0.00 €</td>
            <td><button type="button" class="btn-delete"><i class="fas fa-trash"></i></button></td>
        `;
        itemsContainer.appendChild(tr);

        // Añadir eventos para recalcular cuando cambien números
        const inputs = tr.querySelectorAll('input');
        inputs.forEach(input => input.addEventListener('input', calcularTotales));
        
        // Evento borrar fila
        tr.querySelector('.btn-delete').addEventListener('click', () => {
            tr.remove();
            calcularTotales();
        });
    }

    // Agregar la primera fila al iniciar
    agregarFila();
    // Evento botón agregar
    if(btnAgregar) btnAgregar.addEventListener('click', agregarFila);

    //  FUNCIÓN MATEMÁTICA 
    function calcularTotales() {
        let subtotalTotal = 0;
        const filas = document.querySelectorAll('#itemsContainer tr');

        filas.forEach(fila => {
            const cant = parseFloat(fila.querySelector('.cant').value) || 0;
            const precio = parseFloat(fila.querySelector('.precio').value) || 0;
            const subtotal = cant * precio;
            
            // Pintar subtotal de la fila
            fila.querySelector('.subtotal-fila').textContent = subtotal.toFixed(2) + ' €';
            subtotalTotal += subtotal;
        });
        const iva = subtotalTotal * 0.21;
        const total = subtotalTotal + iva;
        // Pintar totales generales
        const displaySub = document.getElementById('displaySubtotal');
        const displayIva = document.getElementById('displayIva');
        const displayTot = document.getElementById('displayTotal');

        if(displaySub) displaySub.textContent = subtotalTotal.toFixed(2) + ' €';
        if(displayIva) displayIva.textContent = iva.toFixed(2) + ' €';
        if(displayTot) displayTot.textContent = total.toFixed(2) + ' €';
    }

    // 4. ENVIAR FORMULARIO (Crear Factura)

    const formFactura = document.getElementById('facturaForm');
    if(formFactura) {
        formFactura.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Recopilar datos de las filas
            const items = [];
            document.querySelectorAll('#itemsContainer tr').forEach(fila => {
                items.push({
                    concepto: fila.querySelector('.desc').value,
                    descripcion: fila.querySelector('.desc').value, 
                    cantidad: parseFloat(fila.querySelector('.cant').value),
                    precio_unitario: parseFloat(fila.querySelector('.precio').value)
                });
            });
            const nuevaFactura = {
                    empresa_id: empresaId,
                    cliente_id: clienteSelect.value,
                    numero: document.getElementById('numeroFactura').value,
                    fecha_emision: document.getElementById('fechaEmision').value,
                    fecha_vencimiento: document.getElementById('fechaVencimiento').value,
                    estado: document.getElementById('estadoFactura').value, 
                    items: items,
                    notas: document.getElementById('notas').value
            };

            try {
                const res = await fetch('/api/facturas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevaFactura)
                });

                const data = await res.json();

                if (res.ok) {
                    alert(`¡Éxito! Factura creada. \nPDF guardado.`);
                    window.location.href = 'facturas.html'; // Redirigir a la lista
                } else {
                    alert('Error: ' + (data.error || 'Error desconocido'));
                }
            } catch (error) {
                console.error(error);
                alert('Error de conexión');
            }
        });
    }

    // 3. Botón Cerrar Sesión
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('empresaId');
            window.location.href = 'login.html';
        });
    }
});