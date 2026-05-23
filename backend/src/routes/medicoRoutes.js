const express = require('express');

const router = express.Router();
const medicoController = require('../controllers/medicoController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { validateIdParam } = require('../validators/commonValidators');
const { validateMedico } = require('../validators/medicoValidator');

router.get('/', auth, role('admin', 'recepcion', 'medico'), medicoController.getAll);
router.post('/', auth, role('admin'), validateMedico, medicoController.create);
router.put('/:id', auth, role('admin'), validateIdParam(), validateMedico, medicoController.update);
router.delete('/:id', auth, role('admin'), validateIdParam(), medicoController.delete);

module.exports = router;
