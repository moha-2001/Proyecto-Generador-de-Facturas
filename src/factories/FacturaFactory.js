class FacturaFactory {
    static crearFactura(datos) {
        // Validaciones básicas
        if (!datos.items || datos.items.length === 0) {
            throw new Error("La factura debe tener al menos un ítem.");
        }

        // Lógica de Negocio: Calcular totales
        let subtotalCalculado = 0;
        
        // Procesamos los items para asegurar que tienen subtotal
        const itemsProcesados = datos.items.map(item => {
            const subtotalItem = item.cantidad * item.precio_unitario;
            subtotalCalculado += subtotalItem;
            return {
                ...item,
                subtotal: subtotalItem
            };
        });

        const iva = subtotalCalculado * 0.21;
        const total = subtotalCalculado + iva;

        // Devolvemos el objeto limpio listo para el DAO
        return {
            empresa_id: datos.empresa_id,
            cliente_id: datos.cliente_id,
            numero: datos.numero,
            fecha_emision: datos.fecha_emision || new Date(),
            items: itemsProcesados,
            subtotal: subtotalCalculado,
            iva_amount: iva,
            total: total,
            estado: 'Pendiente' // Estado inicial por defecto
        };
    }
}

module.exports = FacturaFactory;