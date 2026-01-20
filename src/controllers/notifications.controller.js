const Notification = require('../models/notifications.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Get all notifications for the current user
 */
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ recipient_id: req.user.id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications
    }
  });
});

/**
 * Get a notification by ID
 */
exports.getNotificationById = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Vérifier que la notification appartient à l'utilisateur connecté
  if (notification.recipient_id.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to access this notification', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

/**
 * Mark a notification as read
 */
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Vérifier que la notification appartient à l'utilisateur connecté
  if (notification.recipient_id.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to update this notification', 403));
  }

  notification.is_read = true;
  await notification.save();

  res.status(200).json({
    status: 'success',
    data: {
      notification
    }
  });
});

/**
 * Mark all notifications as read for the current user
 */
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { recipient_id: req.user.id },
    { is_read: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

/**
 * Delete a notification
 */
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  // Vérifier que la notification appartient à l'utilisateur connecté
  if (notification.recipient_id.toString() !== req.user.id) {
    return next(new AppError('You do not have permission to delete this notification', 403));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
