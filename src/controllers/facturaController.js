const FacturaDAO = require('../dao/FacturaDAO');

const crearFactura = async (req, res) => {
    console.log("--> RECIBIDO EN EL BACKEND:", req.body);
    try {
        const datos = req.body;

        // 1. Calcular totales automáticamente (Lógica de Negocio)
        let subtotalCalculado = 0;
        
        // Recorremos los items para sumar precios
        datos.items.forEach(item => {
            item.subtotal = item.cantidad * item.precio_unitario;
            subtotalCalculado += item.subtotal;
        });

        datos.subtotal = subtotalCalculado;
        datos.iva_amount = subtotalCalculado * 0.21; // IVA del 21%
        datos.total = datos.subtotal + datos.iva_amount;

        // 2. Guardar en base de datos usando el DAO
        const facturaGuardada = await FacturaDAO.crear(datos);

        res.status(201).json({
            mensaje: 'Factura creada y calculada correctamente',
            factura: facturaGuardada
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