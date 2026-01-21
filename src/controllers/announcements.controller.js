const catchAsync = require('../utils/catchAsync');
const AnnouncementsService = require('../services/announcements.service');

exports.createAnnouncement = catchAsync(async (req, res) => {
  const announcement = await AnnouncementsService.createAnnouncement(
    req.body,
    req.user._id
  );

  res.status(201).json({
    status: 'success',
    data: { announcement }
  });
});

exports.getAllAnnouncements = catchAsync(async (req, res) => {
  // Add debug: allow activeOnly=false to see all announcements
  const { activeOnly = 'true', priority, page, limit } = req.query;

  console.log('Query params:', { activeOnly, priority, page, limit }); // Debug

  const result = await AnnouncementsService.getAllAnnouncements({
    activeOnly,
    priority,
    page: Number(page) || 1,
    limit: Number(limit) || 20
  });

  res.status(200).json({
    status: 'success',
    data: result
  });
});

exports.getAnnouncement = catchAsync(async (req, res) => {
  const announcement = await AnnouncementsService.getAnnouncementById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { announcement }
  });
});

exports.updateAnnouncement = catchAsync(async (req, res) => {
  const announcement = await AnnouncementsService.updateAnnouncement(
    req.params.id,
    req.body,
    req.user._id
  );

  res.status(200).json({
    status: 'success',
    data: { announcement }
  });
});

exports.deleteAnnouncement = catchAsync(async (req, res) => {
  const result = await AnnouncementsService.deleteAnnouncement(
    req.params.id,
    req.user._id
  );

  res.status(200).json({
    status: 'success',
    ...result
  });
});