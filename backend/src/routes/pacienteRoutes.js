const express = require('express');

const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { validateIdParam } = require('../validators/commonValidators');
const {
    validatePaciente,
    validateUpdatePaciente,
    validateSearchPaciente
} = require('../validators/pacienteValidator');

router.get('/', auth, role('admin', 'medico', 'recepcion'), pacienteController.getAll);
router.get('/search', auth, validateSearchPaciente, pacienteController.search);
router.get('/:id', auth, validateIdParam(), pacienteController.getById);
router.post('/', auth, role('admin', 'recepcion'), validatePaciente, pacienteController.create);
router.put('/:id', auth, role('admin', 'recepcion'), validateIdParam(), validateUpdatePaciente, pacienteController.update);
router.delete('/:id', auth, role('admin'), validateIdParam(), pacienteController.delete);

module.exports = router;
