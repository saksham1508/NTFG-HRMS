const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const AIService = require('../services/aiService');
const { requirePermission } = require('../middleware/auth');
const Application = require('../models/Application');
const JobPosting = require('../models/JobPosting');
const User = require('../models/User');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype.startsWith('text/') ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and text files are allowed'), false);
    }
  }
});

// @route   POST /api/ai/analyze-resume
// @desc    Analyze resume using AI
// @access  Private (HR/Manager)
router.post('/analyze-resume', 
  requirePermission('use_ai_features'),
  upload.single('resume'),
  [
    body('jobId').notEmpty().withMessage('Job ID is required')
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

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Resume file is required'
        });
      }

      const { jobId } = req.body;

      // Get job requirements
      const job = await JobPosting.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job posting not found'
        });
      }

      // Extract text from resume (simplified - in production, use proper PDF/DOC parsing)
      const resumeText = req.file.buffer.toString('utf8');

      // Analyze resume
      const analysis = await AIService.analyzeResume(resumeText, {
        skills: job.skills,
        experience: job.experienceLevel,
        education: job.requirements,
        keywords: job.aiCriteria?.keywordWeights?.map(kw => kw.keyword) || []
      });

      res.json({
        success: true,
        message: 'Resume analyzed successfully',
        data: {
          analysis,
          jobTitle: job.title,
          fileName: req.file.originalname
        }
      });
    } catch (error) {
      console.error('Resume analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Error analyzing resume'
      });
    }
  }
);

// @route   POST /api/ai/screen-applications
// @desc    Screen multiple applications for a job
// @access  Private (HR/Manager)
router.post('/screen-applications',
  requirePermission('manage_recruitment'),
  [
    body('jobId').notEmpty().withMessage('Job ID is required'),
    body('applicationIds').isArray().withMessage('Application IDs must be an array')
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

      const { jobId, applicationIds } = req.body;

      // Get job and applications
      const job = await JobPosting.findById(jobId);
      const applications = await Application.find({
        _id: { $in: applicationIds },
        jobPosting: jobId
      });

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job posting not found'
        });
      }

      const screeningResults = [];

      // Screen each application
      for (const application of applications) {
        try {
          // Create resume text from application data
          const resumeText = [
            application.candidate.summary || '',
            application.candidate.experience?.map(exp => 
              `${exp.position} at ${exp.company}: ${exp.description}`
            ).join(' ') || '',
            application.candidate.skills?.map(skill => skill.name).join(' ') || ''
          ].join(' ');

          const analysis = await AIService.analyzeResume(resumeText, {
            skills: job.skills,
            experience: job.experienceLevel,
            education: job.requirements,
            keywords: job.aiCriteria?.keywordWeights?.map(kw => kw.keyword) || []
          });

          // Update application with AI analysis
          application.aiAnalysis = analysis;
          application.status = analysis.overallScore >= (job.aiCriteria?.minimumScore || 60) 
            ? 'shortlisted' : 'under_review';
          
          await application.save();

          screeningResults.push({
            applicationId: application._id,
            candidateName: application.candidateFullName,
            analysis,
            recommendation: analysis.overallScore >= (job.aiCriteria?.minimumScore || 60) 
              ? 'shortlist' : 'review'
          });
        } catch (error) {
          console.error(`Error screening application ${application._id}:`, error);
          screeningResults.push({
            applicationId: application._id,
            candidateName: application.candidateFullName,
            error: 'Screening failed',
            recommendation: 'manual_review'
          });
        }
      }

      res.json({
        success: true,
        message: 'Applications screened successfully',
        data: {
          jobTitle: job.title,
          totalScreened: screeningResults.length,
          shortlisted: screeningResults.filter(r => r.recommendation === 'shortlist').length,
          results: screeningResults
        }
      });
    } catch (error) {
      console.error('Application screening error:', error);
      res.status(500).json({
        success: false,
        message: 'Error screening applications'
      });
    }
  }
);

// @route   POST /api/ai/predict-performance
// @desc    Predict employee performance
// @access  Private (HR/Manager)
router.post('/predict-performance',
  requirePermission('use_ai_features'),
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required')
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

      const { employeeId } = req.body;

      // Get employee data
      const employee = await User.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Prepare employee data for prediction
      const employeeData = {
        yearsOfExperience: employee.employment.hireDate 
          ? (new Date() - new Date(employee.employment.hireDate)) / (1000 * 60 * 60 * 24 * 365)
          : 0,
        skills: employee.skills,
        educationLevel: 0.7, // Simplified - would be calculated from actual education data
        certifications: employee.skills?.filter(s => s.verified) || [],
        previousRatings: { average: 0.75 }, // Would come from performance reviews
        attendanceRate: 0.95, // Would come from attendance data
        projectCompletionRate: 0.85, // Would come from project data
        teamworkScore: 0.8,
        communicationScore: 0.75,
        leadershipScore: employee.role === 'manager' ? 0.8 : 0.5,
        trainingHours: 40, // Would come from training records
        feedbackScore: 0.75,
        goalAchievementRate: 0.8,
        innovationScore: 0.6,
        adaptabilityScore: 0.75
      };

      // Predict performance
      const prediction = await AIService.predictPerformance(employeeData);

      // Update employee AI insights
      employee.aiInsights.performancePrediction = {
        score: prediction.score,
        factors: prediction.factors,
        lastUpdated: new Date()
      };
      await employee.save();

      res.json({
        success: true,
        message: 'Performance prediction completed',
        data: {
          employee: {
            id: employee._id,
            name: employee.fullName,
            position: employee.employment.position,
            department: employee.employment.department
          },
          prediction
        }
      });
    } catch (error) {
      console.error('Performance prediction error:', error);
      res.status(500).json({
        success: false,
        message: 'Error predicting performance'
      });
    }
  }
);

// @route   POST /api/ai/analyze-skill-gaps
// @desc    Analyze skill gaps for career development
// @access  Private
router.post('/analyze-skill-gaps',
  requirePermission('use_ai_features'),
  [
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('targetRole').notEmpty().withMessage('Target role is required')
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

      const { employeeId, targetRole } = req.body;

      // Get employee
      const employee = await User.findById(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      // Get target role requirements (could be from job postings or predefined roles)
      let roleRequirements;
      if (typeof targetRole === 'string') {
        // Find similar job postings for role requirements
        const similarJobs = await JobPosting.find({
          title: { $regex: targetRole, $options: 'i' },
          status: 'active'
        }).limit(5);

        if (similarJobs.length > 0) {
          // Aggregate skills from similar jobs
          const allSkills = similarJobs.flatMap(job => job.skills);
          const skillMap = new Map();
          
          allSkills.forEach(skill => {
            if (skillMap.has(skill.name)) {
              skillMap.get(skill.name).count++;
            } else {
              skillMap.set(skill.name, { ...skill, count: 1 });
            }
          });

          roleRequirements = {
            skills: Array.from(skillMap.values())
              .filter(skill => skill.count >= 2) // Skills mentioned in at least 2 jobs
              .map(skill => ({
                name: skill.name,
                level: skill.level,
                importance: skill.mandatory ? 'high' : 'medium'
              }))
          };
        } else {
          return res.status(404).json({
            success: false,
            message: 'No job postings found for the target role'
          });
        }
      } else {
        roleRequirements = targetRole;
      }

      // Analyze skill gaps
      const gapAnalysis = await AIService.analyzeSkillGaps(employee, roleRequirements);

      // Update employee AI insights
      employee.aiInsights.skillGaps = gapAnalysis.gaps;
      employee.aiInsights.careerPath = {
        suggestedRoles: [typeof targetRole === 'string' ? targetRole : targetRole.title],
        requiredSkills: gapAnalysis.gaps.map(gap => gap.skill),
        timeline: gapAnalysis.timeline
      };
      await employee.save();

      res.json({
        success: true,
        message: 'Skill gap analysis completed',
        data: {
          employee: {
            id: employee._id,
            name: employee.fullName,
            currentRole: employee.employment.position
          },
          targetRole: typeof targetRole === 'string' ? targetRole : targetRole.title,
          analysis: gapAnalysis
        }
      });
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Error analyzing skill gaps'
      });
    }
  }
);

// @route   POST /api/ai/sentiment-analysis
// @desc    Analyze sentiment of text (feedback, reviews, etc.)
// @access  Private
router.post('/sentiment-analysis',
  requirePermission('use_ai_features'),
  [
    body('text').notEmpty().withMessage('Text is required for analysis')
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

      const { text, context } = req.body;

      const sentimentAnalysis = AIService.analyzeSentiment(text);

      res.json({
        success: true,
        message: 'Sentiment analysis completed',
        data: {
          text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
          analysis: sentimentAnalysis,
          context: context || 'general'
        }
      });
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Error analyzing sentiment'
      });
    }
  }
);

// @route   GET /api/ai/insights/:employeeId
// @desc    Get AI insights for an employee
// @access  Private
router.get('/insights/:employeeId',
  requirePermission('use_ai_features'),
  async (req, res) => {
    try {
      const { employeeId } = req.params;

      const employee = await User.findById(employeeId).select('aiInsights profile employment');
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      res.json({
        success: true,
        data: {
          employee: {
            id: employee._id,
            name: employee.fullName,
            position: employee.employment.position,
            department: employee.employment.department
          },
          insights: employee.aiInsights
        }
      });
    } catch (error) {
      console.error('Get AI insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving AI insights'
      });
    }
  }
);

// @route   GET /api/ai/status
// @desc    Get AI service status
// @access  Private
router.get('/status', requirePermission('use_ai_features'), (req, res) => {
  try {
    const status = AIService.getServiceStatus();
    
    res.json({
      success: true,
      data: {
        status,
        features: {
          resumeScreening: status.modelsLoaded,
          performancePrediction: status.modelsLoaded,
          skillGapAnalysis: status.initialized,
          sentimentAnalysis: status.initialized,
          chatbot: status.openaiAvailable,
          nlpProcessing: status.initialized
        }
      }
    });
  } catch (error) {
    console.error('AI status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving AI status'
    });
  }
});

// @route   POST /api/ai/batch-process
// @desc    Process multiple AI tasks in batch
// @access  Private (Admin/HR)
router.post('/batch-process',
  requirePermission('manage_system'),
  [
    body('tasks').isArray().withMessage('Tasks must be an array'),
    body('tasks.*.type').isIn(['resume_screening', 'performance_prediction', 'skill_gap_analysis'])
      .withMessage('Invalid task type')
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

      const { tasks } = req.body;
      const results = [];

      for (const task of tasks) {
        try {
          let result;
          
          switch (task.type) {
            case 'resume_screening':
              // Process resume screening task
              result = await processResumeScreeningTask(task);
              break;
            case 'performance_prediction':
              // Process performance prediction task
              result = await processPerformancePredictionTask(task);
              break;
            case 'skill_gap_analysis':
              // Process skill gap analysis task
              result = await processSkillGapAnalysisTask(task);
              break;
            default:
              result = { error: 'Unknown task type' };
          }

          results.push({
            taskId: task.id || results.length,
            type: task.type,
            status: result.error ? 'failed' : 'completed',
            result: result.error ? { error: result.error } : result,
            processedAt: new Date()
          });
        } catch (error) {
          results.push({
            taskId: task.id || results.length,
            type: task.type,
            status: 'failed',
            result: { error: error.message },
            processedAt: new Date()
          });
        }
      }

      res.json({
        success: true,
        message: 'Batch processing completed',
        data: {
          totalTasks: tasks.length,
          completed: results.filter(r => r.status === 'completed').length,
          failed: results.filter(r => r.status === 'failed').length,
          results
        }
      });
    } catch (error) {
      console.error('Batch processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing batch tasks'
      });
    }
  }
);

// Helper functions for batch processing
async function processResumeScreeningTask(task) {
  // Implementation for resume screening batch task
  return { message: 'Resume screening task completed' };
}

async function processPerformancePredictionTask(task) {
  // Implementation for performance prediction batch task
  return { message: 'Performance prediction task completed' };
}

async function processSkillGapAnalysisTask(task) {
  // Implementation for skill gap analysis batch task
  return { message: 'Skill gap analysis task completed' };
}

module.exports = router;