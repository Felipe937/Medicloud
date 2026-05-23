const express = require('express');

const historiaController = require('../controllers/historiaController');
const auth = require('../middleware/authMiddleware');
const { validateIdParam } = require('../validators/commonValidators');
const {
    validateCreateHistoria,
    validateUpdateHistoria
} = require('../validators/historiaValidator');

const router = express.Router();

router.get('/', auth, historiaController.listarHistorias);
router.get('/:id', auth, validateIdParam(), historiaController.obtenerHistoriaPorId);
router.post('/', auth, validateCreateHistoria, historiaController.crearHistoriaClinica);
router.put('/:id', auth, validateIdParam(), validateUpdateHistoria, historiaController.actualizarHistoria);

module.exports = router;
