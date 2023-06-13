const { Router } = require("express");
const Usuario = require("../models/Usuario");
const { request, response } = require("express");
const { validationResult, check } = require('express-validator');
const bycript = require('bcryptjs');
const { generarJWT } = require("../helpers/jwt")

const router = Router();

router.post("/", [
    check('email', 'invalid.email').isEmail(),
    check('contrasena', 'invalid.contrasena').not().isEmpty(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ mensaje: errors.array() });
        }

        const usuarioDB = await Usuario.findOne({ email: req.body.email });
        if (!usuarioDB) {
            return res.status(400).send('User not found');
        }

        const esIgual = bycript.compareSync(req.body.contrasena, usuarioDB.contrasena);
        if (!esIgual) {
            return res.status(400).send('User not found');
        }

        //Generar token
        const token = generarJWT(usuarioDB);

        res.json({
            _id: usuarioDB._id, nombre: usuarioDB.nombre, rol: usuarioDB.rol,
            email: usuarioDB.email, acces_token: token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Internal server error' });
    }
}
);

module.exports = router;