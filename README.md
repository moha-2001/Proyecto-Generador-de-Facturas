# AutoFacturar  - Manual de Instalación y Usuario

**Desarrollado por:** NexoDigital Solutions (Mohammad El Bourkhissi y Walid El Miri)  
**Proyecto:** Gestión Automatizada de Facturación - DAW 2025/26

AutoFacturar es una plataforma web centralizada diseñada para simplificar el flujo de facturación de empresas y autónomos.
Permite la creación de clientes, generación automática de facturas en PDF y notificación automática por correo electrónico.

---

##  1. Requisitos del Sistema

Antes de comenzar, asegúrese de tener instalados los siguientes componentes:

* **Node.js:** Versión 16.x o superior.
* **MongoDB:** Servidor de base de datos activo (local o en la nube).
* **Navegador Web:** Chrome, Edge, Safari o Firefox actualizado.

---

##  2. Tecnologías y Librerías Utilizadas

El sistema utiliza un stack tecnológico moderno para garantizar velocidad y seguridad:

* **Express.js:** Framework del servidor para la gestión de la API REST.
* **MongoDB & Mongoose:** Persistencia de datos eficiente y estructurada.
* **PDFKit:** Generación dinámica y profesional de facturas en formato PDF.
* **Nodemailer:** Notificaciones automáticas por email con enlaces de acceso.
* **Bcrypt.js:** Encriptación de alta seguridad para la protección de contraseñas.
* **Dotenv:** Gestión segura de credenciales y variables de entorno.

---

##  3. Guía de Instalación (Paso a Paso)

Siga estas instrucciones para poner en marcha la aplicación en su entorno:

### Paso 3.1: Descarga y Preparación
Extraiga el contenido del archivo `.ZIP` en una carpeta local. Abra una terminal dentro de esa carpeta.

### Paso 3.2: Instalación de Dependencias
Ejecute el siguiente comando para descargar e instalar automáticamente todos los módulos técnicos necesarios:
```bash
npm install´
```
#### Paso 3.3: Instalación de Dependencias (Librerías) manualmente
Ejecute el siguiente comando en la terminal para instalar el motor del servidor y todas las librerías de terceros
(Base de datos, Generación de PDF, Criptografía y Correos):

```bash
npm install express mongoose pdfkit nodemailer bcryptjs dotenv
```
Paso 3.4: Configuración del Entorno (.env)
Cree un archivo llamado .env en la raíz del proyecto y configure sus credenciales:

Fragmento de código
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/autofacturar
EMAIL_USER=su-correo@gmail.com
EMAIL_PASS=su-clave-de-aplicacion-de-16-letras

## 4. Puesta en Marcha y Primer Acceso
Para iniciar la aplicación, ejecute en su terminal:

Bash
npm run dev

Cómo empezar a usar la plataforma:
Acceso: Abra su navegador y vaya a: http://localhost:3000

Registro: Al ser su primera vez, haga clic en el botón "Registrarse" o "Crear Cuenta".

Panel de Control: Una vez completado el registro, el sistema le redirigirá automáticamente a su panel de administración.

Seguridad: Sus datos de acceso quedan protegidos y encriptados en la base de datos desde el primer momento.


Soporte Técnico
Documentación desarrollada por NexoDigital Solutions. Para asistencia técnica o despliegue en servidores de producción, 
contacte con nuestro equipo de desarrollo.
Melbo@insdanielblanxart.cat
Welmi@insdanielblanxart.cat


