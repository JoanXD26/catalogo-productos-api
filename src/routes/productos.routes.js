const { Router, json } = require('express');
const controller = require('../controllers/productos.controller');
const { autenticar, autorizarRoles } = require('../middlewares/autorizacion');
const {
  validarId,
  validarCategoria,
  validarProducto
} = require('../middlewares/validar-productos');

const router = Router();
const leerJson = json();
const soloAdministrador = autorizarRoles('administrador');

router.get('/', validarCategoria, controller.listar);
router.get('/:id', validarId, controller.consultar);
router.post('/', autenticar, soloAdministrador, leerJson, validarProducto, controller.crear);
router.put('/:id', autenticar, soloAdministrador, validarId, leerJson, validarProducto, controller.actualizar);
router.delete('/:id', autenticar, soloAdministrador, validarId, controller.eliminar);

module.exports = router;