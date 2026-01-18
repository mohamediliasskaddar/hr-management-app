const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employees.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent d'être authentifié
router.use(protect);

router.get('/my-team', employeesController.getMyTeam); 

router
  .route('/')
  .get(
    restrictTo('ADMIN_RH', 'MANAGER'),
    employeesController.getAllEmployees
  )
  .post(restrictTo('ADMIN_RH'), employeesController.createEmployee);

router
  .route('/:id')
  .get(employeesController.getEmployee) 
  .patch(restrictTo('ADMIN_RH', 'MANAGER'), employeesController.updateEmployee)
  .delete(restrictTo('ADMIN_RH'), employeesController.deleteEmployee);

module.exports = router;