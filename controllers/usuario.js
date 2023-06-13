const Usuario = require("../models/Usuario");
const { request, response } = require("express");
const { validationResult, check } = require('express-validator');
const bycript = require('bcryptjs');
const { validarJWT } = require("../middleware/validar-jwt");
const { validarRolAdmin } = require("../middleware/validar-rol-admin");


//Crear
const createUsuario = [
  check('nombre', 'invalid.nombre').not().isEmpty(),
  check('email', 'invalid.email').isEmail(),
  check('rol', 'invalid.rol').isIn(['ADMIN', 'DOCENTE']),
  check('contrasena', 'invalid.contrasena').not().isEmpty(),
  validarJWT, 
  validarRolAdmin,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ mensaje: errors.array() });
      }

      const existeUsuario = await Usuario.findOne({ email: req.body.email });
      if (existeUsuario) {
        return res.status(400).send('Email ya existe');
      }

      let usuarioDB = new Usuario();
      usuarioDB.nombre = req.body.nombre;
      usuarioDB.email = req.body.email;
      usuarioDB.rol = req.body.rol;

      const salt = bycript.genSaltSync();
      const contrasena = bycript.hashSync(req.body.contrasena, salt);
      usuarioDB.contrasena = contrasena;

      usuarioDB.fechaCreacion = new Date();
      usuarioDB.fechaActualizacion = new Date();

      usuarioDB = await usuarioDB.save();
      res.send(usuarioDB);

    } catch (error) {
      console.log(error);
      res.status(500).json({ mensaje: 'Internal server error' });
    }
  }
];

//Listar
const getUsuarios = [ validarJWT, validarRolAdmin,
  async (req = request, res = response) => {
  try {
    const { estado } = req.query;
    const usuarioDB = await Usuario.find({ estado }); //select * from estados where estado=?
    return res.json(usuarioDB);
  } catch (e) {
    return res.status(500).json({
      msg: "Error general " + e,
    });
  }
}];

//Editar
const editarUsuario = [validarJWT, validarRolAdmin,
   async(req, resp) => {
  const { id } = req.params;
  const usuario = req.body;
  const nuevo = {
    nombre: usuario.nombre,
    email: usuario.email,
    estado: usuario.estado,
    rol:usuario.rol
  };
  Usuario.findByIdAndUpdate(id, nuevo, { new: true }).then((result) => {
    resp.json(result);
  });
}];



//Eliminar
const eliminarUsuario = [validarJWT, validarRolAdmin,
(req, resp) => {
  const { id } = req.params;
  Usuario.findByIdAndDelete(id).then((result) => {
    resp.json(result);
  });
}];

module.exports = {
  createUsuario,
  getUsuarios,
  editarUsuario,
  eliminarUsuario,
};
