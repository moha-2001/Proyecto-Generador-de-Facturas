const Factura = require('../models/Factura'); // solo importamos el modelo

class FacturaController {

    async crearFactura(req, res) {
        try {
            // guardamos los datos del formulario
            let datosFactura = req.body;
            // GENERAR EL NUMERO DE FACTURA 
            let fechaActual = new Date();
            let anioActual = fechaActual.getFullYear();
            let nuevoNumero = "FAC-" + anioActual + "-001";

            let facturasEmpresa = await Factura.find({ empresa_id: datosFactura.empresa_id }).sort({ _id: -1 });

            let ultimaFacturaValida = null;
            for (let i = 0; i < facturasEmpresa.length; i++) {
                let numeroFactura = facturasEmpresa[i].numero;
                if (numeroFactura != null && numeroFactura.includes("FAC-" + anioActual)) {
                    ultimaFacturaValida = facturasEmpresa[i];
                    break; 
                }
            }

            if (ultimaFacturaValida != null) {
                let partes = ultimaFacturaValida.numero.split('-');
                if (partes.length === 3) {
                    let ultimoDigito = parseInt(partes[2], 10);
                    if (!isNaN(ultimoDigito)) {
                        let siguienteDigito = ultimoDigito + 1;
                        let digitoConCeros = "";
                        if (siguienteDigito < 10) {
                            digitoConCeros = "00" + siguienteDigito;
                        } else if (siguienteDigito < 100) {
                            digitoConCeros = "0" + siguienteDigito;
                        } else {
                            digitoConCeros = siguienteDigito;
                        }
                        nuevoNumero = "FAC-" + anioActual + "-" + digitoConCeros;
                    }
                }
            }
            
            datosFactura.numero = nuevoNumero;

            // CALCULOS MATEMATICOS
            let subtotalCalculado = 0;

            if (datosFactura.items && datosFactura.items.length > 0) {
                for (let i = 0; i < datosFactura.items.length; i++) {
                    let item = datosFactura.items[i];
                    let cantidad = parseFloat(item.cantidad.toString().replace(',', '.'));
                    let precio = parseFloat(item.precio_unitario.toString().replace(',', '.'));

                    let subtotalLinea = cantidad * precio;
                    item.subtotal = subtotalLinea; 
                    subtotalCalculado = subtotalCalculado + subtotalLinea;
                }
            }
            
            datosFactura.subtotal = subtotalCalculado;
            
            let iva = 21;
            if (datosFactura.iva_porcentaje) {
                iva = datosFactura.iva_porcentaje;
            }
            
            datosFactura.iva_amount = (subtotalCalculado * iva) / 100;
            datosFactura.total = datosFactura.subtotal + datosFactura.iva_amount;

            // GUARDAR EN BASE DE DATOS
            const nuevaFactura = new Factura(datosFactura);
            const facturaGuardada = await nuevaFactura.save();

            // responder al frontend 
            res.status(201).json({
                mensaje: 'factura creada exitosamente en la base de datos',
                factura: facturaGuardada
            });

        } catch (error) {
            console.log("error al crear la factura:", error);
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerFacturas(req, res) {
        try {
            const facturas = await Factura.find({ empresa_id: req.params.empresaId })
                .populate('cliente_id', 'nombre email cif_nif');
            res.json(facturas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerFacturasCliente(req, res) {
        try {
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

            // solo actualizamos la base de datos, sin regenerar pdfs
            const facturaActualizada = await Factura.findByIdAndUpdate(id, { estado: estado }, { new: true });

            if (!facturaActualizada) {
                return res.status(404).json({ error: 'factura no encontrada' });
            }

            res.json({ 
                mensaje: 'estado actualizado en la base de datos', 
                factura: facturaActualizada 
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

            // borrar de la base de datos directamente 
            await Factura.findByIdAndDelete(id);
            res.json({ mensaje: 'factura eliminada correctamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new FacturaController();