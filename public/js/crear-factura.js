document.addEventListener('DOMContentLoaded', async () => {
    const empresaId = localStorage.getItem('empresaId');
    if (!empresaId) window.location.href = 'index.html';

    // 1. Cargar Clientes en el Select
    const clienteSelect = document.getElementById('clienteSelect');
    try {
        const res = await fetch(`/api/clientes/${empresaId}`);
        const clientes = await res.json();
        
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente._id; // El ID de Mongo
            option.textContent = cliente.nombre;
            clienteSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando clientes");
    }

    // Poner fechas por defecto
    document.getElementById('fechaEmision').valueAsDate = new Date();

    // 2. Lógica para Agregar Filas de Productos
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
    btnAgregar.addEventListener('click', agregarFila);

    // 3. Función Matemática (Calcula Totales)
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
        document.getElementById('displaySubtotal').textContent = subtotalTotal.toFixed(2) + ' €';
        document.getElementById('displayIva').textContent = iva.toFixed(2) + ' €';
        document.getElementById('displayTotal').textContent = total.toFixed(2) + ' €';
    }

    // 4. ENVIAR FORMULARIO (Crear Factura)
    document.getElementById('facturaForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Recopilar datos de las filas
        const items = [];
        document.querySelectorAll('#itemsContainer tr').forEach(fila => {
            items.push({
                concepto: fila.querySelector('.desc').value,
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
                alert(`¡Éxito! Factura creada. \nPDF guardado en: ${data.ruta_pdf}`);
                window.location.href = 'facturas.html'; // Redirigir a la lista
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });
});