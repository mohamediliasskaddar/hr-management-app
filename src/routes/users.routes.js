const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/auth.middleware'); // à créer

// Toutes les routes users nécessitent d'être connecté
router.use(protect);

// Seuls les ADMIN_RH peuvent gérer les utilisateurs
router.use(restrictTo('ADMIN_RH'));

router
  .route('/')
  .get(usersController.getAllUsers);

router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

router
  .route('/:id/toggle-status')
  .patch(usersController.toggleUserStatus);

module.exports = router;