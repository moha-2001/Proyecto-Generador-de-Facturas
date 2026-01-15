const FacturaDAO = require('../dao/FacturaDAO');
const NotificacionDAO = require('../dao/NotificacionDAO'); 
const { construirPDF } = require('../services/pdfService'); 
const path = require('path');
const fs = require('fs');

const crearFactura = async (req, res) => {
    try {
        const datos = req.body;

        // 1. Cálculos matemáticos
        let subtotalCalculado = 0;
        datos.items.forEach(item => {
            item.subtotal = item.cantidad * item.precio_unitario;
            subtotalCalculado += item.subtotal;
        });
        datos.subtotal = subtotalCalculado;
        datos.iva_amount = subtotalCalculado * 0.21;
        datos.total = datos.subtotal + datos.iva_amount;

        // ============================================================
        // 🚨 CORRECCIÓN IMPORTANTE AQUÍ ABAJO 🚨
        // ============================================================

        // 2. PRIMERO: Guardamos la factura (Para obtener el ID)
        const facturaGuardada = await FacturaDAO.crear(datos);

        // 3. SEGUNDO: Volvemos a buscarla para traer los datos COMPLETOS (Nombres, Direcciones...)
        // Esto es necesario para que el PDF salga bonito con los datos del cliente/empresa
        const facturaCompleta = await FacturaDAO.buscarPorId(facturaGuardada._id);

        // 4. GENERAR EL PDF 📄 (Usamos facturaCompleta)
        const directorio = path.join(__dirname, '../../facturas');
        if (!fs.existsSync(directorio)){
            fs.mkdirSync(directorio);
        }
        
        const nombreArchivo = `factura-${facturaCompleta.numero}.pdf`;
        const rutaCompleta = path.join(directorio, nombreArchivo);

        // ✅ Pasamos facturaCompleta (que tiene los nombres) al PDF
        construirPDF(facturaCompleta, rutaCompleta);

        // 5. CREAR NOTIFICACIÓN 🔔
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
        console.error(error); // Añadido para ver errores en consola
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

module.exports = { crearFactura, obtenerFacturas, obtenerFacturasCliente };