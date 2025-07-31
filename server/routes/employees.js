const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { requirePermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/employees
// @desc    Get all employees with filtering and pagination
// @access  Private (view_employees permission)
router.get('/', 
  requirePermission('view_employees'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('department').optional().isString().withMessage('Department must be a string'),
    query('status').optional().isIn(['active', 'inactive', 'terminated', 'on-leave']).withMessage('Invalid status'),
    query('search').optional().isString().withMessage('Search must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        page = 1,
        limit = 10,
        department,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      const query = {};
      
      if (department) {
        query['employment.department'] = department;
      }
      
      if (status) {
        query['employment.status'] = status;
      }
      
      if (search) {
        query.$or = [
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [employees, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .populate('employment.manager', 'profile.firstName profile.lastName email')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(query)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: {
          employees,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: total,
            itemsPerPage: parseInt(limit),
            hasNextPage,
            hasPrevPage
          }
        }
      });
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving employees'
      });
    }
  }
);

// @route   GET /api/employees/stats
// @desc    Get employee statistics
// @access  Private (view_employees permission)
router.get('/stats', requirePermission('view_employees'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          activeEmployees: {
            $sum: { $cond: [{ $eq: ['$employment.status', 'active'] }, 1, 0] }
          },
          inactiveEmployees: {
            $sum: { $cond: [{ $eq: ['$employment.status', 'inactive'] }, 1, 0] }
          },
          onLeaveEmployees: {
            $sum: { $cond: [{ $eq: ['$employment.status', 'on-leave'] }, 1, 0] }
          },
          terminatedEmployees: {
            $sum: { $cond: [{ $eq: ['$employment.status', 'terminated'] }, 1, 0] }
          }
        }
      }
    ]);

    const departmentStats = await User.aggregate([
      { $match: { 'employment.status': 'active' } },
      {
        $group: {
          _id: '$employment.department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const roleStats = await User.aggregate([
      { $match: { 'employment.status': 'active' } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalEmployees: 0,
          activeEmployees: 0,
          inactiveEmployees: 0,
          onLeaveEmployees: 0,
          terminatedEmployees: 0
        },
        departmentDistribution: departmentStats,
        roleDistribution: roleStats
      }
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving employee statistics'
    });
  }
});

// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Private (view_employees permission)
router.get('/:id', requirePermission('view_employees'), async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findById(id)
      .select('-password')
      .populate('employment.manager', 'profile.firstName profile.lastName email employeeId');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: { employee }
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving employee'
    });
  }
});

// @route   POST /api/employees
// @desc    Create new employee
// @access  Private (manage_employees permission)
router.post('/',
  requirePermission('manage_employees'),
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('profile.firstName').notEmpty().withMessage('First name is required'),
    body('profile.lastName').notEmpty().withMessage('Last name is required'),
    body('employment.department').notEmpty().withMessage('Department is required'),
    body('employment.position').notEmpty().withMessage('Position is required'),
    body('employment.hireDate').isISO8601().withMessage('Valid hire date is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const employeeData = req.body;

      // Check if employee ID or email already exists
      const existingEmployee = await User.findOne({
        $or: [
          { employeeId: employeeData.employeeId },
          { email: employeeData.email }
        ]
      });

      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee with this ID or email already exists'
        });
      }

      // Create new employee
      const employee = new User(employeeData);
      await employee.save();

      // Remove password from response
      const employeeResponse = employee.toObject();
      delete employeeResponse.password;

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('employee_update', {
          type: 'created',
          employee: employeeResponse
        });
      }

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: { employee: employeeResponse }
      });
    } catch (error) {
      console.error('Create employee error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating employee'
      });
    }
  }
);

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (manage_employees permission)
router.put('/:id',
  requirePermission('manage_employees'),
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('profile.firstName').optional().notEmpty().withMessage('First name cannot be empty'),
    body('profile.lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('employment.department').optional().notEmpty().withMessage('Department cannot be empty'),
    body('employment.position').optional().notEmpty().withMessage('Position cannot be empty')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.employeeId;

      // Check if email is being updated and if it already exists
      if (updateData.email) {
        const existingEmployee = await User.findOne({
          email: updateData.email,
          _id: { $ne: id }
        });

        if (existingEmployee) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      const employee = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('employee_update', {
          type: 'updated',
          employee
        });
      }

      res.json({
        success: true,
        message: 'Employee updated successfully',
        data: { employee }
      });
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating employee'
      });
    }
  }
);

// @route   DELETE /api/employees/:id
// @desc    Delete employee (soft delete)
// @access  Private (manage_employees permission)
router.delete('/:id', requirePermission('manage_employees'), async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting status to terminated
    const employee = await User.findByIdAndUpdate(
      id,
      { 
        $set: { 
          'employment.status': 'terminated',
          isActive: false
        }
      },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('employee_update', {
        type: 'deleted',
        employee
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully',
      data: { employee }
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee'
    });
  }
});

// @route   PUT /api/employees/:id/status
// @desc    Update employee status
// @access  Private (manage_employees permission)
router.put('/:id/status',
  requirePermission('manage_employees'),
  [
    body('status').isIn(['active', 'inactive', 'terminated', 'on-leave'])
      .withMessage('Invalid status')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { status } = req.body;

      const employee = await User.findByIdAndUpdate(
        id,
        { 
          $set: { 
            'employment.status': status,
            isActive: status === 'active'
          }
        },
        { new: true }
      ).select('-password');

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('employee_update', {
          type: 'status_updated',
          employee
        });
      }

      res.json({
        success: true,
        message: 'Employee status updated successfully',
        data: { employee }
      });
    } catch (error) {
      console.error('Update employee status error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating employee status'
      });
    }
  }
);

// @route   GET /api/employees/:id/subordinates
// @desc    Get employee's subordinates
// @access  Private (view_employees permission)
router.get('/:id/subordinates', requirePermission('view_employees'), async (req, res) => {
  try {
    const { id } = req.params;

    const subordinates = await User.find({
      'employment.manager': id,
      'employment.status': 'active'
    }).select('-password');

    res.json({
      success: true,
      data: { subordinates }
    });
  } catch (error) {
    console.error('Get subordinates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving subordinates'
    });
  }
});

module.exports = router;