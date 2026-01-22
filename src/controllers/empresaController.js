const EmpresaDAO = require('../dao/EmpresaDAO');
const bcrypt = require('bcryptjs');

const registrarEmpresa = async (req, res) => {
    try {
        // Guardamos la empresa usando el DAO
        const empresa = await EmpresaDAO.crear(req.body);
        res.status(201).json({
            mensaje: 'Empresa registrada con éxito',
            empresa: empresa
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginEmpresa = async (req, res) => {
    try {
        const { email, password } = req.body;
        const empresa = await EmpresaDAO.buscarPorEmail(email);
        if (!empresa) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        let esCorrecta = false;
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
        const empresa = await EmpresaDAO.buscarPorId(req.params.id);
        res.json(empresa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarEmpresa = async (req, res) => {
    try {
        const empresaActualizada = await EmpresaDAO.actualizar(req.params.id, req.body);
        res.json({ mensaje: "Empresa actualizada", empresa: empresaActualizada });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const cambiarPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { passwordActual, passwordNueva } = req.body;

        const Empresa = require('../models/Empresa');
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
        const salt = await bcrypt.genSalt(10);
        empresa.password = await bcrypt.hash(passwordNueva, salt);
        
        await empresa.save();

        res.json({ mensaje: 'Contraseña actualizada y securizada correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { registrarEmpresa, loginEmpresa, obtenerEmpresa, actualizarEmpresa,cambiarPassword };
