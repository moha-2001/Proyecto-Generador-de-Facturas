const Notificacion = require('../models/Notificacion');

class NotificacionDAO {
    async crear(datos) {
        try {
            const nuevaNotificacion = new Notificacion(datos);
            return await nuevaNotificacion.save();
        } catch (error) {
            console.error("Error al crear notificación:", error);
        }
    }
}

module.exports = new NotificacionDAO();