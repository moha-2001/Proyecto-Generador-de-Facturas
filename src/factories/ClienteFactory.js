class ClienteFactory {
    static crearCliente(datos) {
        if (!datos.nombre || !datos.email) {
            throw new Error("Datos incompletos para crear cliente.");
        }

        return {
            empresa_id: datos.empresa_id,
            nombre: datos.nombre,
            email: datos.email.toLowerCase().trim(),
            cif_nif: datos.cif_nif ? datos.cif_nif.toUpperCase() : 'N/A',
            telefono: datos.telefono,
            direccion: datos.direccion,
            password: datos.password, 
            cambiar_password: true // Forzamos cambio de pass al inicio
        };
    }
}
module.exports = ClienteFactory;