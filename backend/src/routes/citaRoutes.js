const express = require('express');
const {
    createCita,
    getAllCitas,
    getCitaById,
    updateCita,
    deleteCita
} = require('../controllers/citaController');
const {
    validateCreateCita,
    validateUpdateCita
} = require('../validators/citaValidator');

const router = express.Router();

router.get('/', getAllCitas);
router.get('/:id', getCitaById);
router.post('/', validateCreateCita, createCita);
router.put('/:id', validateUpdateCita, updateCita);
router.delete('/:id', deleteCita);

module.exports = router;
