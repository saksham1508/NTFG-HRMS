const express = require('express');
const { query, param, validationResult } = require('express-validator');
const AttendanceRecord = require('../models/AttendanceRecord');
const User = require('../models/User');
const { requirePermission } = require('../middleware/auth');

const router = express.Router();

// Helpers
const startOfDayUTC = (d) => {
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
};

// GET /api/attendance/:employeeId/summary?from&to
router.get(
  '/:employeeId/summary',
  requirePermission('view_employees'),
  [
    param('employeeId').isString().notEmpty(),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
      }

      const { employeeId } = req.params;
      const { from, to } = req.query;

      const employee = await User.findById(employeeId).select('_id');
      if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

      const toDate = to ? new Date(to) : new Date();
      const fromDate = from ? new Date(from) : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);

      const records = await AttendanceRecord.find({
        employee: employeeId,
        date: { $gte: startOfDayUTC(fromDate), $lte: startOfDayUTC(toDate) },
      }).sort({ date: -1 });

      const present = records.filter(r => r.checkIn).length;
      const total = Math.max(1, Math.ceil((startOfDayUTC(toDate) - startOfDayUTC(fromDate)) / (24 * 60 * 60 * 1000)) + 1);

      res.json({
        success: true,
        data: {
          range: { from: startOfDayUTC(fromDate), to: startOfDayUTC(toDate) },
          present,
          total,
          attendanceRate: present / total,
          records: records.map(r => r.toSummary()),
        },
      });
    } catch (error) {
      console.error('Attendance summary error:', error);
      res.status(500).json({ success: false, message: 'Error fetching attendance summary' });
    }
  }
);

// GET /api/attendance/:employeeId/records?from&to
router.get(
  '/:employeeId/records',
  requirePermission('view_employees'),
  [
    param('employeeId').isString().notEmpty(),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
      }

      const { employeeId } = req.params;
      const { from, to } = req.query;

      const employee = await User.findById(employeeId).select('_id');
      if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

      const toDate = to ? new Date(to) : new Date();
      const fromDate = from ? new Date(from) : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);

      const records = await AttendanceRecord.find({
        employee: employeeId,
        date: { $gte: startOfDayUTC(fromDate), $lte: startOfDayUTC(toDate) },
      }).sort({ date: -1 });

      res.json({ success: true, data: records.map(r => r.toSummary()) });
    } catch (error) {
      console.error('Attendance records error:', error);
      res.status(500).json({ success: false, message: 'Error fetching attendance records' });
    }
  }
);

// POST /api/attendance/:employeeId/clock-in
router.post(
  '/:employeeId/clock-in',
  requirePermission('view_employees'),
  [param('employeeId').isString().notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
      }
      const { employeeId } = req.params;

      const employee = await User.findById(employeeId).select('_id');
      if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

      const today = startOfDayUTC(new Date());

      let record = await AttendanceRecord.findOne({ employee: employeeId, date: today });
      if (!record) {
        record = new AttendanceRecord({ employee: employeeId, date: today });
      }
      if (record.checkIn) {
        return res.status(400).json({ success: false, message: 'Already clocked in' });
      }
      record.checkIn = new Date();
      await record.save();

      res.status(201).json({ success: true, message: 'Clock-in recorded', data: record.toSummary() });
    } catch (error) {
      console.error('Clock-in error:', error);
      res.status(500).json({ success: false, message: 'Error recording clock-in' });
    }
  }
);

// POST /api/attendance/:employeeId/clock-out
router.post(
  '/:employeeId/clock-out',
  requirePermission('view_employees'),
  [param('employeeId').isString().notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
      }
      const { employeeId } = req.params;

      const employee = await User.findById(employeeId).select('_id');
      if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

      const today = startOfDayUTC(new Date());

      let record = await AttendanceRecord.findOne({ employee: employeeId, date: today });
      if (!record || !record.checkIn) {
        return res.status(400).json({ success: false, message: 'Clock-in not found for today' });
      }
      if (record.checkOut) {
        return res.status(400).json({ success: false, message: 'Already clocked out' });
      }
      record.checkOut = new Date();
      await record.save();

      res.status(201).json({ success: true, message: 'Clock-out recorded', data: record.toSummary() });
    } catch (error) {
      console.error('Clock-out error:', error);
      res.status(500).json({ success: false, message: 'Error recording clock-out' });
    }
  }
);

module.exports = router;