const { Router, json } = require('express');
const { autenticar } = require('../middlewares/autorizacion');
const { validarId, validarProductoIdEnCuerpo } = require('../middlewares/validar-productos');
const controller = require('../controllers/favoritos.controller');

const router = Router();

router.use(autenticar);
router.get('/', controller.listar);
router.post('/', json(), validarProductoIdEnCuerpo, controller.agregar);
router.delete('/:productoId', validarId, controller.eliminar);

module.exports = router;