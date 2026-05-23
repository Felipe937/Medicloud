const express = require('express');

const {
    createCita,
    getAllCitas,
    getCitaById,
    updateCita,
    deleteCita
} = require('../controllers/citaController');
const auth = require('../middleware/authMiddleware');
const {
    validateCreateCita,
    validateUpdateCita
} = require('../validators/citaValidator');
const { validateIdParam } = require('../validators/commonValidators');

const router = express.Router();

router.get('/', auth, getAllCitas);
router.get('/:id', auth, validateIdParam(), getCitaById);
router.post('/', auth, validateCreateCita, createCita);
router.put('/:id', auth, validateIdParam(), validateUpdateCita, updateCita);
router.delete('/:id', auth, validateIdParam(), deleteCita);

module.exports = router;
