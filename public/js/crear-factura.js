// esperamos a que el html cargue entero antes de hacer nada
document.addEventListener('DOMContentLoaded', async function() {
    
    // comprobamos si el usuario ha iniciado sesion
    let empresaId = localStorage.getItem('empresaId');
    if (empresaId == null) {
        window.location.href = 'index.html'; // si no hay id, lo echamos al login
    }

    // 1. cargar los clientes en el desplegable (select)
    let clienteSelect = document.getElementById('clienteSelect');
    
    try {
        // hacemos la peticion al servidor para traer los clientes de esta empresa
        let respuesta = await fetch('/api/clientes/empresa/' + empresaId);
        let listaClientes = await respuesta.json();
        
        // comprobamos que el servidor nos haya devuelto un array
        if (Array.isArray(listaClientes)) {
            // usamos un bucle for clasico
            for (let i = 0; i < listaClientes.length; i++) {
                let cliente = listaClientes[i];
                
                // creamos la opcion para el html
                let opcion = document.createElement('option');
                opcion.value = cliente._id;
                opcion.textContent = cliente.nombre;
                
                // la añadimos al desplegable
                clienteSelect.appendChild(opcion);
            }
        } else {
            console.log("error: el servidor no devolvio una lista valida de clientes");
        }

    } catch (error) {
        console.log("error al conectarse con el servidor para cargar clientes:", error);
    }


    // 2. poner la fecha de hoy por defecto en el campo de emision
    let fechaInput = document.getElementById('fechaEmision');
    if(fechaInput != null) {
        fechaInput.valueAsDate = new Date();
    }


    // 3. logica para añadir y calcular las filas de productos
    let tablaItems = document.getElementById('itemsContainer');
    let botonAgregar = document.getElementById('btnAgregarItem');

    // funcion que crea una fila nueva de html
    function crearNuevaFila() {
        let fila = document.createElement('tr');
        
        // inyectamos el html de la fila
        fila.innerHTML = `
            <td><input type="text" class="desc" placeholder="Concepto del servicio" required></td>
            <td><input type="number" class="cant" value="1" min="1" required></td>
            <td><input type="number" class="precio" value="0" min="0" step="0.01" required></td>
            <td class="subtotal-fila">0.00 €</td>
            <td><button type="button" class="btn-delete"><i class="fas fa-trash"></i></button></td>
        `;
        
        // la añadimos a la tabla
        tablaItems.appendChild(fila);

        // le decimos a los campos de numero que recalculen los totales cuando el usuario escriba
        let inputsNumero = fila.querySelectorAll('input[type="number"]');
        for (let i = 0; i < inputsNumero.length; i++) {
            inputsNumero[i].addEventListener('input', calcularTotalesFactura);
        }
        
        // le damos vida al boton de la papelera para que borre su propia fila
        let botonBorrar = fila.querySelector('.btn-delete');
        botonBorrar.addEventListener('click', function() {
            fila.remove(); // borra la fila de la pantalla
            calcularTotalesFactura(); // recalculamos el dinero
        });
    }

    // añadimos la primera fila vacia nada mas entrar a la pagina
    crearNuevaFila();

    // cuando hagan click en agregar linea, llamamos a la funcion
    if(botonAgregar != null) {
        botonAgregar.addEventListener('click', crearNuevaFila);
    }


    // 4. funcion de matematicas para actualizar la pantalla
    function calcularTotalesFactura() {
        let sumaSubtotales = 0;
        
        // cogemos todas las filas que haya en la tabla ahora mismo
        let todasLasFilas = document.querySelectorAll('#itemsContainer tr');

        for (let i = 0; i < todasLasFilas.length; i++) {
            let filaActual = todasLasFilas[i];
            
            // sacamos los valores de los inputs. si esta vacio, le ponemos un 0
            let cajaCantidad = filaActual.querySelector('.cant').value;
            let cajaPrecio = filaActual.querySelector('.precio').value;
            
            let cantidad = parseFloat(cajaCantidad) || 0;
            let precio = parseFloat(cajaPrecio) || 0;
            
            let subtotalFila = cantidad * precio;
            
            // actualizamos el texto de esa fila en concreto
            filaActual.querySelector('.subtotal-fila').textContent = subtotalFila.toFixed(2) + ' €';
            
            // lo sumamos a la hucha global
            sumaSubtotales = sumaSubtotales + subtotalFila;
        }
        
        // calculamos el iva español por defecto
        let ivaCalculado = sumaSubtotales * 0.21;
        let totalFinal = sumaSubtotales + ivaCalculado;
        
        // pintamos los resultados abajo del todo
        document.getElementById('displaySubtotal').textContent = sumaSubtotales.toFixed(2) + ' €';
        document.getElementById('displayIva').textContent = ivaCalculado.toFixed(2) + ' €';
        document.getElementById('displayTotal').textContent = totalFinal.toFixed(2) + ' €';
    }


    // 5. enviar el formulario final al servidor 
    let formulario = document.getElementById('facturaForm');
    
    if(formulario != null) {
        formulario.addEventListener('submit', async function(evento) {
            
            evento.preventDefault(); // evitamos que la pagina haga f5
            
            // preparamos un array vacio para meter los productos
            let listaProductos = [];
            
            // recorremos la tabla para coger lo que ha escrito el usuario
            let filasTabla = document.querySelectorAll('#itemsContainer tr');
            
            for (let i = 0; i < filasTabla.length; i++) {
                let fila = filasTabla[i];
                
                let conceptoEscrito = fila.querySelector('.desc').value;
                let cantidadEscrita = fila.querySelector('.cant').value;
                let precioEscrito = fila.querySelector('.precio').value;
                
                // creamos un objeto por cada linea y lo metemos en el array
                let producto = {
                    concepto: conceptoEscrito,
                    cantidad: parseFloat(cantidadEscrita),
                    precio_unitario: parseFloat(precioEscrito)
                };
                
                listaProductos.push(producto);
            }
            
            // construimos el objeto gordo que mandaremos al controlador
            let datosParaServidor = {
                empresa_id: empresaId,
                cliente_id: document.getElementById('clienteSelect').value,
                fecha_emision: document.getElementById('fechaEmision').value,
                fecha_vencimiento: document.getElementById('fechaVencimiento').value,
                estado: document.getElementById('estadoFactura').value, 
                items: listaProductos,
                notas: document.getElementById('notas').value
                // no enviamos el numero de factura, el servidor lo calculara
            };

            try {
                // hacemos la peticion por metodo post
                let respuesta = await fetch('/api/facturas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosParaServidor)
                });

                let resultado = await respuesta.json();

                if (respuesta.ok == true) {
                    alert('¡factura creada con exito!');
                    window.location.href = 'facturas.html'; // lo mandamos a la lista
                } else {
                    alert('error del servidor: ' + resultado.error);
                }
                
            } catch (error) {
                console.log("error al intentar enviar el fetch:", error);
                alert('error de conexion con el servidor');
            }
        });
    }


    // 6. logica del boton de cerrar sesion
    let botonSalir = document.getElementById('btnLogout');
    if (botonSalir != null) {
        botonSalir.addEventListener('click', function() {
            localStorage.removeItem('empresaId'); 
            window.location.href = 'index.html'; 
        });
    }
    
});