const { Router } = require('express');
const controller = require('../controllers/productos.controller');
const {
  validarId,
  validarCategoria,
  validarProducto
} = require('../middlewares/validar-productos');

const router = Router();

router.get('/', validarCategoria, controller.listar);
router.get('/:id', validarId, controller.consultar);
router.post('/', validarProducto, controller.crear);
router.put('/:id', validarId, validarProducto, controller.actualizar);
router.delete('/:id', validarId, controller.eliminar);

module.exports = router;