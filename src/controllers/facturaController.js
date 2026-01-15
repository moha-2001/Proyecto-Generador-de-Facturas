const FacturaDAO = require('../dao/FacturaDAO');
const NotificacionDAO = require('../dao/NotificacionDAO'); // <--- Importamos esto
const { construirPDF } = require('../services/pdfService'); // <--- Importamos esto
const path = require('path');
const fs = require('fs');

const crearFactura = async (req, res) => {
    try {
        const datos = req.body;

        // 1. Cálculos matemáticos (Igual que antes)
        let subtotalCalculado = 0;
        datos.items.forEach(item => {
            item.subtotal = item.cantidad * item.precio_unitario;
            subtotalCalculado += item.subtotal;
        });
        datos.subtotal = subtotalCalculado;
        datos.iva_amount = subtotalCalculado * 0.21;
        datos.total = datos.subtotal + datos.iva_amount;

        // 2. Guardar Factura en BD
        const facturaGuardada = await FacturaDAO.crear(datos);

        // 3. GENERAR EL PDF 📄
        // Definimos dónde se guardará. Creamos la carpeta 'facturas' si no existe
        const directorio = path.join(__dirname, '../../facturas');
        if (!fs.existsSync(directorio)){
            fs.mkdirSync(directorio);
        }
        
        const nombreArchivo = `factura-${facturaGuardada.numero}.pdf`;
        const rutaCompleta = path.join(directorio, nombreArchivo);

        // Llamamos al servicio para que pinte el PDF
        construirPDF(facturaGuardada, rutaCompleta);

        // 4. CREAR NOTIFICACIÓN 🔔
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

module.exports = { crearFactura, obtenerFacturas };