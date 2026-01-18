const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware'); // À créer

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Routes protégées
router.use(protect); // ← toutes les routes suivantes nécessitent un token
router.patch('/change-password', authController.changePassword);

module.exports = router;    