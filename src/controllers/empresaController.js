const EmpresaDAO = require('../dao/EmpresaDAO');

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
        // Buscamos una empresa que tenga ESE email y ESA contraseña
        const empresa = await EmpresaDAO.buscarPorEmail(email);
        
        if (!empresa || empresa.password !== password) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        res.json({ 
            mensaje: 'Login correcto', 
            id: empresa._id,
            tipo: 'empresa'
        });
    } catch (error) {
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

// No olvides exportarlas al final:
module.exports = { registrarEmpresa, loginEmpresa, obtenerEmpresa, actualizarEmpresa };
