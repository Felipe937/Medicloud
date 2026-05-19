const express = require('express');
const router = express.Router();
const historiaController = require('../controllers/historiaController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.get('/paciente/:id_paciente', auth, role('admin', 'medico'), historiaController.getByPaciente);
router.post('/', auth, role('admin', 'medico'), historiaController.create);

module.exports = router;
