const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const Application = require('../models/Application');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ntfg_hrms';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    const users = [
      {
        employeeId: 'NTFG-ADMIN-001',
        email: 'admin@ntfg.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+1-555-0001',
        },
        employment: {
          department: 'IT',
          position: 'System Administrator',
          hireDate: new Date('2023-01-01'),
          status: 'active',
        },
        permissions: [
          'manage_users',
          'manage_employees',
          'manage_recruitment',
          'view_analytics',
          'use_ai_features',
          'manage_system',
        ],
        isActive: true,
      },
      {
        employeeId: 'NTFG-HR-001',
        email: 'hr@ntfg.com',
        password: await bcrypt.hash('hr123', 12),
        role: 'hr',
        profile: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          phone: '+1-555-0002',
        },
        employment: {
          department: 'Human Resources',
          position: 'HR Manager',
          hireDate: new Date('2023-02-01'),
          status: 'active',
        },
        permissions: [
          'manage_employees',
          'manage_recruitment',
          'view_analytics',
          'use_ai_features',
        ],
        isActive: true,
      },
      {
        employeeId: 'NTFG-MGR-001',
        email: 'manager@ntfg.com',
        password: await bcrypt.hash('manager123', 12),
        role: 'manager',
        profile: {
          firstName: 'Michael',
          lastName: 'Chen',
          phone: '+1-555-0003',
        },
        employment: {
          department: 'Engineering',
          position: 'Engineering Manager',
          hireDate: new Date('2023-03-01'),
          status: 'active',
        },
        permissions: [
          'view_team',
          'manage_team_performance',
          'view_analytics',
          'use_ai_features',
        ],
        isActive: true,
      },
      {
        employeeId: 'NTFG-EMP-001',
        email: 'employee@ntfg.com',
        password: await bcrypt.hash('employee123', 12),
        role: 'employee',
        profile: {
          firstName: 'Emily',
          lastName: 'Davis',
          phone: '+1-555-0004',
        },
        employment: {
          department: 'Engineering',
          position: 'Software Developer',
          hireDate: new Date('2023-04-01'),
          status: 'active',
        },
        permissions: [
          'view_profile',
          'update_profile',
          'request_leave',
          'view_payslips',
        ],
        isActive: true,
      },
    ];

    const created = await User.insertMany(users);
    console.log('✅ Sample users created');
    return created;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

const seedJobPostings = async () => {
  try {
    // Clear existing job postings
    await JobPosting.deleteMany({});
    console.log('🗑️  Cleared existing job postings');

    const jobPostings = [
      {
        title: 'Senior Full Stack Developer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        type: 'full-time',
        description: 'We are looking for a Senior Full Stack Developer to join our growing engineering team. You will be responsible for developing and maintaining our AI-powered HRMS platform.',
        requirements: [
          "Bachelor's degree in Computer Science or related field",
          '5+ years of experience in full-stack development',
          'Proficiency in React.js, Node.js, and MongoDB',
          'Experience with AI/ML technologies is a plus',
          'Strong problem-solving skills',
        ],
        responsibilities: [
          'Develop and maintain web applications',
          'Collaborate with cross-functional teams',
          'Write clean, maintainable code',
          'Participate in code reviews',
          'Mentor junior developers',
        ],
        salaryRange: {
          min: 120000,
          max: 160000,
        },
        benefits: [
          'Health insurance',
          'Dental and vision coverage',
          '401(k) matching',
          'Flexible work hours',
          'Remote work options',
        ],
        status: 'active',
        postedBy: null, // Will be set after users are created
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        requiredSkills: ['React.js', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript'],
        experienceLevel: 'senior',
        isRemote: true,
        applicationCount: 0,
      },
      {
        title: 'AI/ML Engineer',
        department: 'Engineering',
        location: 'Remote',
        type: 'full-time',
        description: 'Join our AI team to develop cutting-edge machine learning solutions for HR processes. You will work on resume screening, performance prediction, and other AI-powered features.',
        requirements: [
          "Master's degree in Computer Science, AI, or related field",
          '3+ years of experience in machine learning',
          'Proficiency in Python, TensorFlow, PyTorch',
          'Experience with NLP and computer vision',
          'Strong mathematical background',
        ],
        responsibilities: [
          'Develop and deploy ML models',
          'Research new AI techniques',
          'Optimize model performance',
          'Collaborate with product team',
          'Maintain AI infrastructure',
        ],
        salaryRange: {
          min: 140000,
          max: 180000,
        },
        benefits: [
          'Health insurance',
          'Stock options',
          'Learning budget',
          'Conference attendance',
          'Flexible PTO',
        ],
        status: 'active',
        postedBy: null,
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Machine Learning'],
        experienceLevel: 'mid-senior',
        isRemote: true,
        applicationCount: 0,
      },
      {
        title: 'UX/UI Designer',
        department: 'Design',
        location: 'New York, NY',
        type: 'full-time',
        description: 'We are seeking a talented UX/UI Designer to create intuitive and beautiful user experiences for our HRMS platform.',
        requirements: [
          "Bachelor's degree in Design or related field",
          '4+ years of UX/UI design experience',
          'Proficiency in Figma, Sketch, Adobe Creative Suite',
          'Experience with design systems',
          'Strong portfolio demonstrating design skills',
        ],
        responsibilities: [
          'Design user interfaces and experiences',
          'Create wireframes and prototypes',
          'Conduct user research',
          'Collaborate with development team',
          'Maintain design system',
        ],
        salaryRange: {
          min: 90000,
          max: 120000,
        },
        benefits: [
          'Health insurance',
          'Creative software licenses',
          'Design conference budget',
          'Flexible work schedule',
          'Modern office space',
        ],
        status: 'active',
        postedBy: null,
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        requiredSkills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
        experienceLevel: 'mid-level',
        isRemote: false,
        applicationCount: 0,
      },
    ];

    await JobPosting.insertMany(jobPostings);
    console.log('✅ Sample job postings created');
    return jobPostings;
  } catch (error) {
    console.error('❌ Error seeding job postings:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDB();
    
    const users = await seedUsers();
    await seedJobPostings();
    
    // Update job postings with postedBy references
    const hrUser = users.find(user => user.role === 'hr');
    if (hrUser) {
      await JobPosting.updateMany({}, { postedBy: hrUser._id });
      console.log('✅ Updated job postings with HR user reference');
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Accounts Created:');
    console.log('Admin: admin@ntfg.com / admin123');
    console.log('HR: hr@ntfg.com / hr123');
    console.log('Manager: manager@ntfg.com / manager123');
    console.log('Employee: employee@ntfg.com / employee123');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };