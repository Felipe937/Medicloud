const express = require('express');
const router = express.Router();
const medicoController = require('../controllers/medicoController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/', auth, role('admin', 'recepcion', 'medico'), medicoController.getAll);
router.post('/', auth, role('admin'), medicoController.create);
router.put('/:id', auth, role('admin'), medicoController.update);
router.delete('/:id', auth, role('admin'), medicoController.delete);

module.exports = router;
