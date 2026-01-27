const FacturaDAO = require('../dao/FacturaDAO');
const NotificacionDAO = require('../dao/NotificacionDAO'); 
const { construirPDF } = require('../services/pdfService'); 
const { enviarFacturaPorCorreo } = require('../services/emailService');
const path = require('path');
const fs = require('fs');

const crearFactura = async (req, res) => {
    try {
        const datos = req.body;
        //  Cálculos matemáticos
        let subtotalCalculado = 0;
        datos.items.forEach(item => {
            item.subtotal = item.cantidad * item.precio_unitario;
            subtotalCalculado += item.subtotal;
        });
        datos.subtotal = subtotalCalculado;
        datos.iva_amount = subtotalCalculado * 0.21;
        datos.total = datos.subtotal + datos.iva_amount;
        // Guardamos la factura (Para obtener el ID)
        const facturaGuardada = await FacturaDAO.crear(datos);

        //  Volvemos a buscarla para traer los datos COMPLETOS 
        const facturaCompleta = await FacturaDAO.buscarPorId(facturaGuardada._id);
        //  EL PDF  
        const directorio = path.join(__dirname, '../../facturas');
        if (!fs.existsSync(directorio)){
            fs.mkdirSync(directorio);
        }
        
        const nombreArchivo = `factura-${facturaCompleta.numero}.pdf`;
        const rutaCompleta = path.join(directorio, nombreArchivo);

        // Pasamos facturaCompleta (que tiene los nombres) al PDF
        construirPDF(facturaCompleta, rutaCompleta);

        setTimeout(async () => {
            if (facturaCompleta.cliente_id && facturaCompleta.cliente_id.email) {
                console.log("📨 Enviando correo a:", facturaCompleta.cliente_id.email);
                
                // PASAMOS AHORA 5 ARGUMENTOS (El último es el NIF)
                await enviarFacturaPorCorreo(
                    facturaCompleta.cliente_id.email,     // Email
                    facturaCompleta.cliente_id.nombre,    // Nombre
                    facturaCompleta.numero,               // Nº Factura
                    rutaCompleta,                         // Ruta PDF
                    facturaCompleta.cliente_id.cif_nif    // DNI/NIF (Contraseña)
                );
            }
        }, 1500);

        //  CREAR NOTIFICACIÓN 
        await NotificacionDAO.crear({
            empresa_id: facturaGuardada.empresa_id,
            cliente_id: facturaGuardada.cliente_id,
            factura_id: facturaGuardada._id,
            mensaje: `Nueva factura generada: ${facturaGuardada.numero}`,
            tipo: 'Info'
        });

        res.status(201).json({
            mensaje: 'Factura creada, PDF generado y cliente notificado',
            factura: facturaGuardada,
            ruta_pdf: rutaCompleta
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerFacturas = async (req, res) => {
    try {
        const { empresaId } = req.params;
        const facturas = await FacturaDAO.listarPorEmpresa(empresaId);
        res.json(facturas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerFacturasCliente = async (req, res) => {
    try {
        const facturas = await FacturaDAO.listarPorCliente(req.params.clienteId);
        res.json(facturas);
    } catch (error) { res.status(500).json({ error: error.message }); }
};
const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // Recibiremos { estado: "Pagada" }
        const Factura = require('../models/Factura'); // Importación directa por si acaso
        const facturaActualizada = await Factura.findByIdAndUpdate(
            id, 
            { estado: estado }, 
            { new: true } // Para que devuelva la versión nueva
        );
        if (!facturaActualizada) {
            return res.status(404).json({ error: 'Factura no encontrada' });
        }
        res.json({ mensaje: 'Estado actualizado', factura: facturaActualizada });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const Factura = require('../models/Factura');
        //  Buscar la factura
        const factura = await Factura.findById(id);
        if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
        // Borar archivo PDF (Opcional, para no ocupar espacio)
        const rutaPDF = path.join(__dirname, '../../facturas', `factura-${factura.numero}.pdf`);
        if (fs.existsSync(rutaPDF)) {
            fs.unlinkSync(rutaPDF);
        }
        //  Borrar de la BD
        await Factura.findByIdAndDelete(id);
        res.json({ mensaje: 'Factura eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { crearFactura, obtenerFacturas, obtenerFacturasCliente, actualizarEstado, eliminarFactura };