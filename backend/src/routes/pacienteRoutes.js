const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', auth, role('admin', 'medico', 'recepcion'), pacienteController.getAll);
router.get('/search', auth, pacienteController.search);
router.get('/:id', auth, pacienteController.getById);
router.post('/', auth, role('admin', 'recepcion'), pacienteController.create);
router.put('/:id', auth, role('admin', 'recepcion'), pacienteController.update);
router.delete('/:id', auth, role('admin'), pacienteController.delete);

module.exports = router;
