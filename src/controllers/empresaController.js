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
    // Aquí haremos el login más adelante
    res.json({ mensaje: "Login pendiente de implementar" });
};

module.exports = { registrarEmpresa, loginEmpresa };