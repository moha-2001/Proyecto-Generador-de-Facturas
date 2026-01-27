const FacturaDAO = require('../dao/FacturaDAO');
const NotificacionDAO = require('../dao/NotificacionDAO');
const FacturaFactory = require('../factories/FacturaFactory');
const { construirPDF } = require('../services/pdfService'); 
const { enviarFacturaPorCorreo } = require('../services/emailService');
const path = require('path');
const fs = require('fs');

class FacturaController {

    async crearFactura(req, res) {
        try {
            // PATRÓN FACTORY: Delegamos los cálculos matemáticos
            const datosFactura = FacturaFactory.crearFactura(req.body);

            // PATRÓN DAO: Guardamos
            const facturaGuardada = await FacturaDAO.crear(datosFactura);

            // DAO: Recuperamos datos completos (populates)
            const facturaCompleta = await FacturaDAO.buscarPorId(facturaGuardada._id);

            // --- Generación de PDF (Lógica de servicio/controlador) ---
            const directorio = path.join(__dirname, '../../facturas');
            if (!fs.existsSync(directorio)) fs.mkdirSync(directorio);
            
            const nombreArchivo = `factura-${facturaCompleta.numero}.pdf`;
            const rutaCompleta = path.join(directorio, nombreArchivo);

            construirPDF(facturaCompleta, rutaCompleta);

            // Envío de correo asíncrono
            setTimeout(async () => {
                if (facturaCompleta.cliente_id?.email) {
                    await enviarFacturaPorCorreo(
                        facturaCompleta.cliente_id.email,
                        facturaCompleta.cliente_id.nombre,
                        facturaCompleta.numero,
                        rutaCompleta,
                        facturaCompleta.cliente_id.cif_nif
                    );
                }
            }, 1500);

            // Crear notificación (Usando DAO)
            await NotificacionDAO.crear({
                empresa_id: facturaGuardada.empresa_id,
                cliente_id: facturaGuardada.cliente_id,
                factura_id: facturaGuardada._id,
                mensaje: `Nueva factura generada: ${facturaGuardada.numero}`,
                tipo: 'Info'
            });

            res.status(201).json({
                mensaje: 'Factura creada exitosamente',
                factura: facturaGuardada,
                ruta_pdf: rutaCompleta
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerFacturas(req, res) {
        try {
            const facturas = await FacturaDAO.listarPorEmpresa(req.params.empresaId);
            res.json(facturas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async obtenerFacturasCliente(req, res) {
        try {
            const facturas = await FacturaDAO.listarPorCliente(req.params.clienteId);
            res.json(facturas);
        } catch (error) { res.status(500).json({ error: error.message }); }
    }

    async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const factura = await FacturaDAO.actualizarEstado(id, estado);
            if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
            res.json({ mensaje: 'Estado actualizado', factura });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async eliminarFactura(req, res) {
        try {
            const { id } = req.params;
            // Usamos DAO para buscar antes de borrar (para borrar el PDF)
            const factura = await FacturaDAO.buscarPorId(id);
            if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

            // Borrar PDF físico
            const rutaPDF = path.join(__dirname, '../../facturas', `factura-${factura.numero}.pdf`);
            if (fs.existsSync(rutaPDF)) fs.unlinkSync(rutaPDF);

            // Borrar de BD usando DAO
            await FacturaDAO.eliminar(id);
            res.json({ mensaje: 'Factura eliminada' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new FacturaController();