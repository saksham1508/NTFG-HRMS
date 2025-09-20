const express = require('express');
const { query, param, body, validationResult } = require('express-validator');
const PerformanceReview = require('../models/PerformanceReview');
const User = require('../models/User');
const { requirePermission } = require('../middleware/auth');

const router = express.Router();

// GET /api/performance/:employeeId/summary
router.get(
  '/:employeeId/summary',
  requirePermission('view_employees'),
  [param('employeeId').isString().notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
      }
      const { employeeId } = req.params;

      const employee = await User.findById(employeeId).select('employment profile');
      if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

      // Aggregate latest reviews
      const reviews = await PerformanceReview.find({ employee: employeeId }).sort({ createdAt: -1 }).limit(6);

      const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
      const allScores = reviews.map(r => r.overallScore);
      const averageScore = Math.round(avg(allScores));

      const latest = reviews[0] || null;

      res.json({
        success: true,
        data: {
          employee: {
            id: employee._id,
            name: `${employee.profile?.firstName || ''} ${employee.profile?.lastName || ''}`.trim() || undefined,
            department: employee.employment?.department,
            position: employee.employment?.position,
          },
          averageScore,
          recentReviews: reviews,
          latestReview: latest,
        },
      });
    } catch (error) {
      console.error('Performance summary error:', error);
      res.status(500).json({ success: false, message: 'Error fetching performance summary' });
    }
  }
);

// GET /api/performance/:employeeId/reviews
router.get(
  '/:employeeId/reviews',
  requirePermission('view_employees'),
  [param('employeeId').isString().notEmpty(), query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
      }

      const { employeeId } = req.params;
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        PerformanceReview.find({ employee: employeeId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('reviewer', 'profile.firstName profile.lastName email'),
        PerformanceReview.countDocuments({ employee: employeeId }),
      ]);

      res.json({
        success: true,
        data: {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({ success: false, message: 'Error fetching performance reviews' });
    }
  }
);

// POST /api/performance/:employeeId/reviews
router.post(
  '/:employeeId/reviews',
  requirePermission('manage_employees'),
  [
    param('employeeId').isString().notEmpty(),
    body('reviewer').notEmpty().withMessage('Reviewer is required'),
    body('period.from').isISO8601().withMessage('Period.from is required and must be a date'),
    body('period.to').isISO8601().withMessage('Period.to is required and must be a date'),
    body('ratings').optional().isObject(),
    body('overallScore').optional().isFloat({ min: 0, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
      }

      const { employeeId } = req.params;
      const employee = await User.findById(employeeId).select('_id');
      if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

      const review = new PerformanceReview({
        employee: employeeId,
        reviewer: req.body.reviewer,
        period: req.body.period,
        ratings: req.body.ratings,
        overallScore: req.body.overallScore ?? 60,
        comments: req.body.comments,
        goals: req.body.goals || [],
      });

      await review.save();

      res.status(201).json({ success: true, message: 'Review created', data: review });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({ success: false, message: 'Error creating performance review' });
    }
  }
);

module.exports = router;