const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcements.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent d'être authentifié
router.use(protect);

router
  .route('/')
  .get(announcementsController.getAllAnnouncements)           
  .post(
    restrictTo('ADMIN_RH', 'MANAGER'),                       
    announcementsController.createAnnouncement
  );

router
  .route('/:id')
  .get(announcementsController.getAnnouncement)
  .patch(
    restrictTo('ADMIN_RH', 'MANAGER'),
    announcementsController.updateAnnouncement
  )
  .delete(
    restrictTo('ADMIN_RH', 'MANAGER'),
    announcementsController.deleteAnnouncement
  );

module.exports = router;