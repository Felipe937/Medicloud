const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const authenticateToken = require('../middleware/authMiddleware');

// RUTAS PÚBLICAS

// @route   POST /api/auth/register
// @desc    Registrar un nuevo usuario
// @access  Público (En producción, podrías querer que solo un Admin registre usuarios)
router.post('/register', validateRegister, authController.register);

// @route   POST /api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Público
router.post('/login', validateLogin, authController.login);

// RUTAS PROTEGIDAS

// @route   GET /api/auth/profile
// @desc    Obtener perfil del usuario autenticado
// @access  Privado (Cualquier usuario logueado)
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
