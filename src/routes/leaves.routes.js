const express = require('express');
const router = express.Router();
const leavesController = require('../controllers/leaves.controller');
const { protect } = require('../middlewares/auth.middleware');
const { attachEmployeeToUser } = require('../middlewares/employee.middleware');
const { restrictTo } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(attachEmployeeToUser); // Ajoute req.employee

// Employé : créer et voir ses propres demandes
router.post('/', leavesController.createLeaveRequest);
router.get('/my-requests', leavesController.getMyLeaveRequests);

// Gestion (manager / RH)
router.patch(
  '/:id/process',
  restrictTo('MANAGER', 'ADMIN_RH'),
  leavesController.processLeaveRequest
);

// Voir une demande spécifique (avec vérification d'accès)
router.get('/:id', leavesController.getLeaveRequest);

module.exports = router;