const Factura = require('../models/Factura'); // importamos el modelo de la base de datos
const Notificacion = require('../models/Notificacion'); // importamos el modelo de notificaciones
const { construirPDF } = require('../services/pdfService'); 
const { enviarFacturaPorCorreo } = require('../services/emailService');
const path = require('path');
const fs = require('fs');

class FacturaController {

    async crearFactura(req, res) {
        try {
            // guardamos los datos del formulario
            let datosFactura = req.body;
            // generar el numero de factura de forma automatica
            let fechaActual = new Date();
            let anioActual = fechaActual.getFullYear();
            // nos traemos TODAS las facturas de la empresa 
            let facturasEmpresa = await Factura.find({ empresa_id: datosFactura.empresa_id });
            // creamos una variable para guardar el numero mas alto que encontremos
            let numeroMasAlto = 0;
            // recorremos todas las facturas una por una
            for (let i = 0; i < facturasEmpresa.length; i++) {
                let numeroFactura = facturasEmpresa[i].numero;
                // comprobamos que el numero exista y sea de este año
                if (numeroFactura != null && numeroFactura.includes("FAC-" + anioActual)) {
                    // lo partimos por los guiones
                    let partes = numeroFactura.split('-');
                    if (partes.length === 3) {
                        // sacamos el ultimo numero
                        let digito = parseInt(partes[2], 10);
                        // si es un numero valido y es MAYOR que el que teniamos guardado, lo actualizamos
                        if (!isNaN(digito) && digito > numeroMasAlto) {
                            numeroMasAlto = digito;
                        }
                    }
                }
            }
            // le sumamos 1 al numero mas alto que hayamos encontrado (si no habia, sera 0 + 1 = 1)
            let siguienteDigito = numeroMasAlto + 1;           
            // añadimos los ceros a la izquierda segun haga falta
            let digitoConCeros = "";
            if (siguienteDigito < 10) {
                digitoConCeros = "00" + siguienteDigito;
            } else if (siguienteDigito < 100) {
                digitoConCeros = "0" + siguienteDigito;
            } else {
                digitoConCeros = siguienteDigito;
            }
            // juntamos todo el texto del nuevo numero
            let nuevoNumero = "FAC-" + anioActual + "-" + digitoConCeros;
            // asignamos el numero generado a los datos que vamos a guardar
            datosFactura.numero = nuevoNumero;
            // calculos matematicos de la factura
            let subtotalCalculado = 0;
            // recorremos los productos con un bucle for clasico
            if (datosFactura.items && datosFactura.items.length > 0) {
                for (let i = 0; i < datosFactura.items.length; i++) {
                    let item = datosFactura.items[i];
                    // convertimos a numero y cambiamos coma por punto por si acaso
                    let cantidad = parseFloat(item.cantidad.toString().replace(',', '.'));
                    let precio = parseFloat(item.precio_unitario.toString().replace(',', '.'));
                    let subtotalLinea = cantidad * precio;
                    item.subtotal = subtotalLinea; // guardamos el subtotal de esta linea
                    // vamos sumando al total global
                    subtotalCalculado = subtotalCalculado + subtotalLinea;
                }
            }
            datosFactura.subtotal = subtotalCalculado;
            // calculamos el iva
            let iva = 21;
            if (datosFactura.iva_porcentaje) {
                iva = datosFactura.iva_porcentaje;
            }
            // calculamos el dinero del iva (el modelo pide especificamente iva_amount)
            datosFactura.iva_amount = (subtotalCalculado * iva) / 100;
            // calculamos el precio final total
            datosFactura.total = datosFactura.subtotal + datosFactura.iva_amount;
            // guardar directamente en la base de datos usando mongoose
            const nuevaFactura = new Factura(datosFactura);
            const facturaGuardada = await nuevaFactura.save();
            // buscar la factura otra vez haciendo populate para cruzar los datos del cliente
            const facturaCompleta = await Factura.findById(facturaGuardada._id)
                .populate('cliente_id')
                .populate('empresa_id');
            // preparamos la ruta para guardar el pdf en el disco duro
            const directorio = path.join(__dirname, '../../facturas');
            if (!fs.existsSync(directorio)) {
                fs.mkdirSync(directorio);
            }
            const nombreArchivo = "factura-" + facturaCompleta.numero + ".pdf";
            const rutaCompleta = path.join(directorio, nombreArchivo);
            // llamamos al servicio para crear el archivo fisico del pdf
            construirPDF(facturaCompleta, rutaCompleta);
            // esperamos un poco y enviamos el correo para que de tiempo a crearse el pdf
            setTimeout(async () => {
                if (facturaCompleta.cliente_id && facturaCompleta.cliente_id.email) {
                    await enviarFacturaPorCorreo(
                        facturaCompleta.cliente_id.email,
                        facturaCompleta.cliente_id.nombre,
                        facturaCompleta.numero,
                        rutaCompleta,
                        facturaCompleta.cliente_id.cif_nif
                    );
                }
            }, 1500);
            // registrar el aviso en la coleccion de notificaciones
            const nuevaNotif = new Notificacion({
                empresa_id: facturaGuardada.empresa_id,
                cliente_id: facturaGuardada.cliente_id,
                factura_id: facturaGuardada._id,
                mensaje: "nueva factura generada: " + facturaGuardada.numero,
                tipo: 'Info'
            });
            await nuevaNotif.save();
            // devolver la respuesta correcta al frontend
            res.status(201).json({
                mensaje: 'factura creada exitosamente',
                factura: facturaGuardada,
                ruta_pdf: rutaCompleta
            });
        } catch (error) {
            console.log("error al crear la factura:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerFacturas(req, res) {
        try {
            // buscar las facturas y traernos los datos del cliente
            const facturas = await Factura.find({ empresa_id: req.params.empresaId })
                .populate('cliente_id', 'nombre email cif_nif');
            res.json(facturas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerFacturasCliente(req, res) {
        try {
            // buscar facturas de un cliente en concreto
            const facturas = await Factura.find({ cliente_id: req.params.clienteId })
                .populate('empresa_id', 'nombre');
            res.json(facturas);
        } catch (error) { 
            res.status(500).json({ error: error.message }); 
        }
    }

    async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body; 
            // actualizamos el estado en la base de datos
            await Factura.findByIdAndUpdate(id, { estado: estado });
            // buscamos la factura entera con sus relaciones para poder rehacer el pdf
            const facturaCompleta = await Factura.findById(id)
                .populate('cliente_id')
                .populate('empresa_id');
            if (!facturaCompleta) {
                return res.status(404).json({ error: 'factura no encontrada' });
            }
            // calculamos la ruta y sobreescribimos el pdf viejo
            const directorio = path.join(__dirname, '../../facturas');
            const nombreArchivo = "factura-" + facturaCompleta.numero + ".pdf";
            const rutaCompleta = path.join(directorio, nombreArchivo);
            construirPDF(facturaCompleta, rutaCompleta); 
            res.json({ 
                mensaje: 'estado actualizado y pdf regenerado', 
                factura: facturaCompleta 
            });
        } catch (error) {
            console.log("error al cambiar el estado:", error);
            res.status(500).json({ error: 'error al actualizar la factura' });
        }
    }

    async eliminarFactura(req, res) {
        try {
            const { id } = req.params;
            const factura = await Factura.findById(id);
            if (!factura) {
                return res.status(404).json({ error: 'factura no encontrada' });
            }
            // borrar el archivo pdf del disco duro si existe
            const rutaPDF = path.join(__dirname, '../../facturas', "factura-" + factura.numero + ".pdf");
            if (fs.existsSync(rutaPDF)) {
                fs.unlinkSync(rutaPDF);
            }
            // borrar de la base de datos
            await Factura.findByIdAndDelete(id);
            res.json({ mensaje: 'factura eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new FacturaController();