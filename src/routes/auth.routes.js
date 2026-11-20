const { Router, json } = require('express');
const { registrar, iniciarSesion } = require('../controllers/auth.controller');

const router = Router();

router.use(json());
router.post('/registro', registrar);
router.post('/login', iniciarSesion);

module.exports = router;