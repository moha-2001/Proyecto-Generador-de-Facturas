const Empresa = require('../models/Empresa'); // Llamamos directo a la Base de Datos
const bcrypt = require('bcryptjs');

const registrarEmpresa = async (req, res) => {
    try {
        const { password } = req.body;

        // VALIDACIÓN DE SEGURIDAD PARA LA CONTRASEÑA
        if (password) {
            const passwordRegex = /^[A-Z](?=.*\d)(?=.*[\W_]).{7,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({ 
                    error: 'La contraseña debe tener mínimo 8 caracteres, EMPEZAR por mayúscula, y contener un número y un carácter especial.' 
                });
            }
        }

        // GUARDADO DIRECTO CON MONGOOSE 
        const nuevaEmpresa = new Empresa(req.body);
        const empresaGuardada = await nuevaEmpresa.save();

        res.status(201).json({
            mensaje: 'Empresa registrada con éxito',
            empresa: empresaGuardada
        });
    } catch (error) {
        // Mongoose lanzará error si el email o CIF ya existen (por el unique: true)
        res.status(500).json({ error: 'Error al registrar la empresa: ' + error.message });
    }
};

const loginEmpresa = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // BÚSQUEDA DIRECTA CON MONGOOSE
        const empresa = await Empresa.findOne({ email: email });
        
        if (!empresa) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        let esCorrecta = false;
        // Comprobación por si en pruebas metiste contraseñas sin encriptar
        if (empresa.password === password) {
            esCorrecta = true;
        } else {
            esCorrecta = await bcrypt.compare(password, empresa.password);
        }

        if (!esCorrecta) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        res.json({ 
            mensaje: 'Login correcto', 
            id: empresa._id,
            tipo: 'empresa'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const obtenerEmpresa = async (req, res) => {
    try {
        // BÚSQUEDA POR ID CON MONGOOSE
        const empresa = await Empresa.findById(req.params.id);
        res.json(empresa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarEmpresa = async (req, res) => {
    try {
        // ACTUALIZACIÓN DIRECTA CON MONGOOSE
        const empresaActualizada = await Empresa.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Para que devuelva el dato ya actualizado
        );
        res.json({ mensaje: "Empresa actualizada", empresa: empresaActualizada });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const cambiarPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { passwordActual, passwordNueva } = req.body;

        // VALIDACIÓN DE SEGURIDAD
        const passwordRegex = /^[A-Z](?=.*\d)(?=.*[\W_]).{7,}$/;
        if (!passwordRegex.test(passwordNueva)) {
            return res.status(400).json({ 
                error: 'La nueva contraseña debe tener mínimo 8 caracteres, EMPEZAR por mayúscula, y contener un número y un carácter especial.' 
            });
        }

        const empresa = await Empresa.findById(id);
        if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

        let esCorrecta = false;
        if (empresa.password === passwordActual) {
            esCorrecta = true;
        } else {
            try {
                esCorrecta = await bcrypt.compare(passwordActual, empresa.password);
            } catch (e) {
                esCorrecta = false;
            }
        }

        if (!esCorrecta) {
            return res.status(400).json({ error: 'La contraseña actual no es correcta' });
        }

        // Encriptar y guardar
        const salt = await bcrypt.genSalt(10);
        empresa.password = await bcrypt.hash(passwordNueva, salt);
        await empresa.save();

        res.json({ mensaje: 'Contraseña actualizada correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { registrarEmpresa, loginEmpresa, obtenerEmpresa, actualizarEmpresa, cambiarPassword };