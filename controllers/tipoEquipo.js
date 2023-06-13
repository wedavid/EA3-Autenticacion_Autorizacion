const TipoEquipo = require("../models/tipoEquipo");
const { request, response } = require("express");
const { validarJWT } = require("../middleware/validar-jwt");
const { validarRolAdmin } = require("../middleware/validar-rol-admin");

//Crear
const createTipoEquipo = [validarJWT, validarRolAdmin,
async (req = request, res = response) => {
  try {
    const nombre = req.body.nombre ? req.body.nombre.toUpperCase() : "";
    const tipoEquipoDB = await TipoEquipo.findOne({ nombre }); //select * from tipoEquipo where nombre=?

    if (tipoEquipoDB) {
      return res.status(400).json({ msg: "Ya existe" });
    }
    const data = {
      nombre, // nombre: nombre
    };
    const tipoEquipo = new TipoEquipo(data);
    console.log(tipoEquipo);
    await tipoEquipo.save();
    return res.status(201).json(tipoEquipo);
  } catch (e) {
    return res.status(500).json({
      msg: "Error general " + e,
    });
  }
}];

//Listar
const getTipoEquipos = [validarJWT, validarRolAdmin,
async (req = request, res = response) => {
  try {   
    const tipoEquiposDB = await TipoEquipo.find(); 
    return res.json(tipoEquiposDB);
  } catch (e) {
    return res.status(500).json({
      msg: "Error general " + e,
    });
  }
}];

//Editar
  const editarTipoEquipo  = [validarJWT, validarRolAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, estado } = req.body;
      const tipoEquipo = await TipoEquipo.findByIdAndUpdate(
        id,
        { nombre, estado },
        { new: true }
      );
      res.json(tipoEquipo);
    } catch (error) {
      res.status(500).json({ error: 'Ha ocurrido un error' });
    }
  }];

//Eliminar
const eliminarEquipo = [validarJWT, validarRolAdmin,
async(req = request, res = response) => {
  const { id } = req.params;
  TipoEquipo.findByIdAndDelete(id).then((result) => {
    res.json(result);
  });
}];

module.exports = {
  createTipoEquipo,
  getTipoEquipos,
  editarTipoEquipo,
  eliminarEquipo,
};
