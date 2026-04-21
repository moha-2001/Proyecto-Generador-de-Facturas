const nodemailer = require('nodemailer');

// Configuración del Transporte 
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mohamedbenel2001@gmail.com', 
        pass: 'uxkp aiod piue fiyg' 
    }
});

//  RECIBIMOS EL NIF TAMBIÉN
const enviarFacturaPorCorreo = async (clienteEmail, clienteNombre, numeroFactura, rutaPDF, clienteNif) => {
    try {
        // Enlace la web
        const urlWeb = "http://localhost:3000"; 

        const mailOptions = {
            from: '"AutoFacturar - NexoDigital" <tucorreo@gmail.com>',
            to: clienteEmail,
            subject: `Nueva Factura ${numeroFactura} y Acceso a tu Panel`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    
                    <div style="background-color: #4a90e2; padding: 20px; text-align: center; color: white;">
                        <h1 style="margin: 0;">NexoDigital</h1>
                        <p style="margin: 5px 0 0;">Gestión de Facturas</p>
                    </div>

                    <div style="padding: 20px;">
                        <h2 style="color: #4a90e2;">Hola, ${clienteNombre}</h2>
                        
                        <p>Adjuntamos la nueva factura <strong>${numeroFactura}</strong>.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #e67e22;">
                            <h3 style="margin-top: 0; color: #e67e22;"> Acceso a tu Área de Cliente</h3>
                            <p>Hemos creado una cuenta para que puedas consultar todas tus facturas online.</p>
                            <p><strong>Tus credenciales de acceso son:</strong></p>
                            <ul>
                                <li><strong>Email:</strong> ${clienteEmail}</li>
                                <li><strong>Contraseña temporal:</strong> ${clienteNif} (Tu DNI/NIF)</li>
                            </ul>
                            <p style="font-size: 0.9em; color: #666;">
                                <em> Por seguridad, el sistema te pedirá cambiar esta contraseña la primera vez que entres.</em>
                            </p>
                            
                            <div style="text-align: center; margin-top: 20px;">
                                <a href="${urlWeb}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                    Entrar a mi Panel
                                </a>
                            </div>
                        </div>

                        <p style="margin-top: 30px;">Gracias por tu confianza.</p>
                    </div>

                    <div style="background-color: #eee; padding: 10px; text-align: center; font-size: 12px; color: #777;">
                        Este es un mensaje automático, por favor no respondas a este correo.
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `Factura-${numeroFactura}.pdf`,
                    path: rutaPDF
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Correo enviado con credenciales: %s', info.messageId);
        return true;

    } catch (error) {
        console.error('Error enviando correo:', error);
        return false;
    }
};

module.exports = { enviarFacturaPorCorreo };