// middleware/validationMiddleware.js
const { body, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  next();
};

// Booking validation
exports.validateBooking = [
  body('teacherId')
    .notEmpty().withMessage('Teacher ID is required')
    .isMongoId().withMessage('Invalid teacher ID format'),

  body('classId')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid class ID format'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom(value => {
      const now = new Date();
      const startDate = new Date(value);

      if (startDate < now) {
        throw new Error('Start date cannot be in the past');
      }

      return true;
    }),

  body('isTrial')
    .optional()
    .isBoolean().withMessage('Trial status must be a boolean'),

  body('recurrence.isRecurring')
    .optional()
    .isBoolean().withMessage('Recurring status must be a boolean'),

  body('recurrence.schedules')
    .optional()
    .isArray().withMessage('Schedules must be an array')
    .custom((schedules, { req }) => {
      if (req.body.recurrence?.isRecurring && (!schedules || schedules.length === 0)) {
        throw new Error('Recurring bookings must have at least one schedule');
      }
      return true;
    }),

  body('recurrence.schedules.*.dayOfWeek')
    .optional()
    .isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0 and 6'),

  body('recurrence.schedules.*.startTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be in HH:MM format'),

  body('recurrence.schedules.*.endTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be in HH:MM format')
    .custom((endTime, { path, req }) => {
      const index = path.match(/\d+/)[0];
      const startTime = req.body.recurrence?.schedules[index]?.startTime;

      if (startTime && endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        if (endMinutes <= startMinutes) {
          throw new Error('End time must be after start time');
        }
      }

      return true;
    }),

  body('recurrence.schedules.*.timezone')
    .optional()
    .notEmpty().withMessage('Timezone is required for recurring schedules'),

  body('recurrence.until')
    .optional()
    .isISO8601().withMessage('Until date must be a valid date')
    .custom((value, { req }) => {
      if (!value) return true;

      const startDate = new Date(req.body.startDate);
      const untilDate = new Date(value);

      if (untilDate <= startDate) {
        throw new Error('End recurrence date must be after start date');
      }

      return true;
    }),

  body('payment.amount')
    .notEmpty().withMessage('Payment amount is required')
    .isFloat({ min: 0 }).withMessage('Payment amount must be a positive number'),

  body('payment.currency')
    .optional()
    .isString().withMessage('Currency must be a string')
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),

  body('payment.method')
    .optional()
    .isString().withMessage('Payment method must be a string'),

  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string'),

  body('meetingLink')
    .optional()
    .isURL().withMessage('Meeting link must be a valid URL'),

  // Handle validation errors
  handleValidationErrors
];

// Feedback validation
exports.validateFeedback = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .isString().withMessage('Comment must be a string'),

  handleValidationErrors
];

// Status update validation
exports.validateStatusUpdate = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'refunded', 'no-show'])
    .withMessage('Invalid status value'),

  body('notes')
    .optional()
    .isString().withMessage('Notes must be a string'),

  handleValidationErrors
];

// Meeting link validation
exports.validateMeetingLink = [
  body('meetingLink')
    .notEmpty().withMessage('Meeting link is required')
    .isURL().withMessage('Meeting link must be a valid URL'),

  handleValidationErrors
];

module.exports = exports;