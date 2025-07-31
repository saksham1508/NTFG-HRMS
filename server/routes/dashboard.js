const express = require('express');
const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const Application = require('../models/Application');

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview statistics
// @access  Private
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    // Common stats for all users
    const totalEmployees = await User.countDocuments({ 'employment.status': 'active' });
    const activeJobPostings = await JobPosting.countDocuments({ status: 'active' });

    stats.common = {
      totalEmployees,
      activeJobPostings,
      myDepartment: req.user.employment.department,
      myPosition: req.user.employment.position
    };

    // Role-specific stats
    switch (userRole) {
      case 'admin':
      case 'hr':
        // HR and Admin get comprehensive stats
        const [
          pendingApplications,
          todayApplications,
          upcomingInterviews,
          pendingLeaveRequests,
          employeesByDepartment,
          recentHires
        ] = await Promise.all([
          Application.countDocuments({ status: { $in: ['submitted', 'under_review'] } }),
          Application.countDocuments({
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }),
          Application.countDocuments({
            'interviews.scheduledDate': {
              $gte: new Date(),
              $lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
            },
            'interviews.status': 'scheduled'
          }),
          // This would be from a Leave model - simplified for now
          0,
          User.aggregate([
            { $match: { 'employment.status': 'active' } },
            { $group: { _id: '$employment.department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
          User.find({
            'employment.hireDate': {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }).select('profile.firstName profile.lastName employment.hireDate employment.department').limit(5)
        ]);

        stats.hr = {
          pendingApplications,
          todayApplications,
          upcomingInterviews,
          pendingLeaveRequests,
          employeesByDepartment,
          recentHires
        };
        break;

      case 'manager':
        // Managers get team-specific stats
        const [
          teamMembers,
          teamApplications,
          teamPerformanceReviews
        ] = await Promise.all([
          User.find({ 'employment.manager': userId }).select('profile.firstName profile.lastName employment.position'),
          Application.find({
            jobPosting: {
              $in: await JobPosting.find({ hiringManager: userId }).select('_id')
            }
          }).countDocuments(),
          // This would be from a PerformanceReview model - simplified for now
          0
        ]);

        stats.manager = {
          teamSize: teamMembers.length,
          teamMembers,
          teamApplications,
          teamPerformanceReviews
        };
        break;

      case 'employee':
        // Employees get personal stats
        const [
          myApplications,
          myPerformanceReviews,
          myTrainingPrograms
        ] = await Promise.all([
          // This would track employee's own applications if they applied internally
          0,
          // This would be from a PerformanceReview model
          0,
          // This would be from a Training model
          0
        ]);

        stats.employee = {
          myApplications,
          myPerformanceReviews,
          myTrainingPrograms,
          joinDate: req.user.employment.hireDate,
          yearsOfService: req.user.employment.hireDate 
            ? Math.floor((new Date() - new Date(req.user.employment.hireDate)) / (365.25 * 24 * 60 * 60 * 1000))
            : 0
        };
        break;
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard overview'
    });
  }
});

// @route   GET /api/dashboard/activities
// @desc    Get recent activities
// @access  Private
router.get('/activities', async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    let activities = [];

    // Get recent activities based on user role
    if (userRole === 'admin' || userRole === 'hr') {
      // HR and Admin see all activities
      const [recentApplications, recentEmployees, recentJobPostings] = await Promise.all([
        Application.find()
          .populate('jobPosting', 'title department')
          .sort({ createdAt: -1 })
          .limit(5)
          .select('candidate.personalInfo.firstName candidate.personalInfo.lastName status createdAt'),
        User.find({ 'employment.status': 'active' })
          .sort({ createdAt: -1 })
          .limit(3)
          .select('profile.firstName profile.lastName employment.department createdAt'),
        JobPosting.find()
          .populate('postedBy', 'profile.firstName profile.lastName')
          .sort({ createdAt: -1 })
          .limit(3)
          .select('title department status createdAt postedBy')
      ]);

      // Format activities
      recentApplications.forEach(app => {
        activities.push({
          id: app._id,
          type: 'application',
          title: 'New Application Received',
          description: `${app.candidate.personalInfo.firstName} ${app.candidate.personalInfo.lastName} applied for ${app.jobPosting?.title}`,
          timestamp: app.createdAt,
          status: app.status
        });
      });

      recentEmployees.forEach(emp => {
        activities.push({
          id: emp._id,
          type: 'employee',
          title: 'New Employee Added',
          description: `${emp.profile.firstName} ${emp.profile.lastName} joined ${emp.employment.department}`,
          timestamp: emp.createdAt,
          status: 'active'
        });
      });

      recentJobPostings.forEach(job => {
        activities.push({
          id: job._id,
          type: 'job_posting',
          title: 'New Job Posted',
          description: `${job.title} position posted in ${job.department}`,
          timestamp: job.createdAt,
          status: job.status
        });
      });
    } else if (userRole === 'manager') {
      // Managers see team-related activities
      const teamMembers = await User.find({ 'employment.manager': userId }).select('_id');
      const teamMemberIds = teamMembers.map(member => member._id);

      // Get activities related to team members
      const teamActivities = await User.find({
        _id: { $in: teamMemberIds }
      })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('profile.firstName profile.lastName employment.status updatedAt');

      teamActivities.forEach(member => {
        activities.push({
          id: member._id,
          type: 'team_update',
          title: 'Team Member Update',
          description: `${member.profile.firstName} ${member.profile.lastName} status: ${member.employment.status}`,
          timestamp: member.updatedAt,
          status: member.employment.status
        });
      });
    } else {
      // Employees see their own activities
      activities.push({
        id: userId,
        type: 'profile',
        title: 'Profile Last Updated',
        description: 'Your profile information was last updated',
        timestamp: req.user.updatedAt,
        status: 'active'
      });
    }

    // Sort activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: { activities: activities.slice(0, 10) }
    });
  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving recent activities'
    });
  }
});

// @route   GET /api/dashboard/events
// @desc    Get upcoming events
// @access  Private
router.get('/events', async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    let events = [];

    // Get upcoming interviews if user is HR/Admin or hiring manager
    if (userRole === 'admin' || userRole === 'hr') {
      const upcomingInterviews = await Application.find({
        'interviews.scheduledDate': { $gte: new Date() },
        'interviews.status': 'scheduled'
      })
      .populate('jobPosting', 'title')
      .select('candidate.personalInfo.firstName candidate.personalInfo.lastName interviews jobPosting')
      .limit(10);

      upcomingInterviews.forEach(app => {
        app.interviews.forEach(interview => {
          if (interview.scheduledDate >= new Date() && interview.status === 'scheduled') {
            events.push({
              id: `interview_${app._id}_${interview._id}`,
              type: 'interview',
              title: `Interview - ${app.jobPosting?.title}`,
              description: `Interview with ${app.candidate.personalInfo.firstName} ${app.candidate.personalInfo.lastName}`,
              date: interview.scheduledDate,
              duration: interview.duration || 60,
              location: interview.location || interview.meetingLink || 'TBD'
            });
          }
        });
      });
    }

    // Get job posting deadlines
    if (userRole === 'admin' || userRole === 'hr') {
      const jobDeadlines = await JobPosting.find({
        applicationDeadline: { $gte: new Date() },
        status: 'active'
      })
      .select('title applicationDeadline department')
      .limit(5);

      jobDeadlines.forEach(job => {
        events.push({
          id: `deadline_${job._id}`,
          type: 'deadline',
          title: `Application Deadline - ${job.title}`,
          description: `Applications close for ${job.title} in ${job.department}`,
          date: job.applicationDeadline,
          duration: 0,
          location: 'Online'
        });
      });
    }

    // Add some sample company events (in production, these would come from an Events model)
    const sampleEvents = [
      {
        id: 'company_meeting_1',
        type: 'meeting',
        title: 'All Hands Meeting',
        description: 'Monthly company-wide meeting',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        duration: 120,
        location: 'Main Conference Room'
      },
      {
        id: 'training_1',
        type: 'training',
        title: 'AI & Technology Workshop',
        description: 'Learn about latest AI tools and technologies',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In 2 weeks
        duration: 240,
        location: 'Training Center'
      }
    ];

    events = [...events, ...sampleEvents];

    // Sort events by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: { events: events.slice(0, 10) }
    });
  } catch (error) {
    console.error('Dashboard events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving upcoming events'
    });
  }
});

// @route   GET /api/dashboard/performance-metrics
// @desc    Get performance metrics for charts
// @access  Private
router.get('/performance-metrics', async (req, res) => {
  try {
    const userRole = req.user.role;

    if (!req.user.hasPermission('view_analytics')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Employee growth over time (last 12 months)
    const employeeGrowth = await User.aggregate([
      {
        $match: {
          'employment.hireDate': {
            $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$employment.hireDate' },
            month: { $month: '$employment.hireDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Application status distribution
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Department-wise employee distribution
    const departmentStats = await User.aggregate([
      {
        $match: { 'employment.status': 'active' }
      },
      {
        $group: {
          _id: '$employment.department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Job posting performance (applications per job)
    const jobPerformance = await JobPosting.aggregate([
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'jobPosting',
          as: 'applications'
        }
      },
      {
        $project: {
          title: 1,
          department: 1,
          applicationCount: { $size: '$applications' },
          createdAt: 1
        }
      },
      {
        $sort: { applicationCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        employeeGrowth,
        applicationStats,
        departmentStats,
        jobPerformance
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving performance metrics'
    });
  }
});

// @route   GET /api/dashboard/employee-distribution
// @desc    Get employee distribution data
// @access  Private
router.get('/employee-distribution', async (req, res) => {
  try {
    if (!req.user.hasPermission('view_analytics')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [
      departmentDistribution,
      roleDistribution,
      statusDistribution,
      experienceDistribution
    ] = await Promise.all([
      // Department distribution
      User.aggregate([
        { $match: { 'employment.status': 'active' } },
        { $group: { _id: '$employment.department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Role distribution
      User.aggregate([
        { $match: { 'employment.status': 'active' } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Status distribution
      User.aggregate([
        { $group: { _id: '$employment.status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Experience distribution (based on hire date)
      User.aggregate([
        {
          $match: { 'employment.status': 'active' }
        },
        {
          $addFields: {
            yearsOfService: {
              $divide: [
                { $subtract: [new Date(), '$employment.hireDate'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        },
        {
          $bucket: {
            groupBy: '$yearsOfService',
            boundaries: [0, 1, 3, 5, 10, 100],
            default: 'Unknown',
            output: {
              count: { $sum: 1 }
            }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        departmentDistribution,
        roleDistribution,
        statusDistribution,
        experienceDistribution
      }
    });
  } catch (error) {
    console.error('Employee distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving employee distribution'
    });
  }
});

// @route   GET /api/dashboard/recruitment-funnel
// @desc    Get recruitment funnel data
// @access  Private
router.get('/recruitment-funnel', async (req, res) => {
  try {
    if (!req.user.hasPermission('view_recruitment')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const funnelData = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Define the recruitment funnel stages in order
    const stageOrder = [
      'submitted',
      'under_review',
      'ai_screening',
      'shortlisted',
      'interview_scheduled',
      'interviewed',
      'assessment',
      'reference_check',
      'offer_extended',
      'hired',
      'rejected'
    ];

    // Organize data according to funnel stages
    const organizedFunnel = stageOrder.map(stage => {
      const stageData = funnelData.find(item => item._id === stage);
      return {
        stage,
        count: stageData ? stageData.count : 0,
        label: stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      };
    });

    // Calculate conversion rates
    const totalApplications = funnelData.reduce((sum, item) => sum + item.count, 0);
    const funnelWithRates = organizedFunnel.map(stage => ({
      ...stage,
      percentage: totalApplications > 0 ? ((stage.count / totalApplications) * 100).toFixed(1) : 0
    }));

    res.json({
      success: true,
      data: {
        funnel: funnelWithRates,
        totalApplications,
        conversionRates: {
          screeningToShortlist: calculateConversionRate(organizedFunnel, 'under_review', 'shortlisted'),
          shortlistToInterview: calculateConversionRate(organizedFunnel, 'shortlisted', 'interviewed'),
          interviewToOffer: calculateConversionRate(organizedFunnel, 'interviewed', 'offer_extended'),
          offerToHire: calculateConversionRate(organizedFunnel, 'offer_extended', 'hired')
        }
      }
    });
  } catch (error) {
    console.error('Recruitment funnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving recruitment funnel data'
    });
  }
});

// Helper function to calculate conversion rates
function calculateConversionRate(funnelData, fromStage, toStage) {
  const fromCount = funnelData.find(stage => stage.stage === fromStage)?.count || 0;
  const toCount = funnelData.find(stage => stage.stage === toStage)?.count || 0;
  
  if (fromCount === 0) return 0;
  return ((toCount / fromCount) * 100).toFixed(1);
}

module.exports = router;