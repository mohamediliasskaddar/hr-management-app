const express = require('express');
const router = express.Router();
const attendancesController = require('../controllers/attendances.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { attachEmployeeToUser } = require('../middlewares/employee.middleware'); // À créer

// Toutes les routes nécessitent authentification
router.use(protect);

// Routes employé (son propre suivi)
router.use(attachEmployeeToUser); // Ajoute req.employee

router.post('/record', attendancesController.recordAttendance);
router.get('/my-history', attendancesController.getMyAttendances);
router.get('/today', attendancesController.getTodayAttendance);

// Routes administration / RH
router.get(
  '/daily-summary',
  restrictTo('ADMIN_RH', 'MANAGER'),
  attendancesController.getDailySummary
);

module.exports = router;