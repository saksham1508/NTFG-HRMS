import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          if (data.message !== 'Invalid credentials') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden - insufficient permissions
          console.error('Access denied:', data.message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
        case 422:
          // Validation error
          console.error('Validation error:', data.errors);
          break;
        case 429:
          // Rate limit exceeded
          console.error('Rate limit exceeded');
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API error:', data.message);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    } else {
      // Other error
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export const employeeAPI = {
  getEmployees: (params) => api.get('/employees', { params }),
  getEmployee: (id) => api.get(`/employees/${id}`),
  createEmployee: (employeeData) => api.post('/employees', employeeData),
  updateEmployee: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  deleteEmployee: (id) => api.delete(`/employees/${id}`),
  getEmployeeStats: () => api.get('/employees/stats'),
};

export const recruitmentAPI = {
  getJobPostings: (params) => api.get('/recruitment/jobs', { params }),
  getJobPosting: (id) => api.get(`/recruitment/jobs/${id}`),
  createJobPosting: (jobData) => api.post('/recruitment/jobs', jobData),
  updateJobPosting: (id, jobData) => api.put(`/recruitment/jobs/${id}`, jobData),
  deleteJobPosting: (id) => api.delete(`/recruitment/jobs/${id}`),
  
  getApplications: (params) => api.get('/recruitment/applications', { params }),
  getApplication: (id) => api.get(`/recruitment/applications/${id}`),
  createApplication: (applicationData) => api.post('/recruitment/applications', applicationData),
  updateApplication: (id, applicationData) => api.put(`/recruitment/applications/${id}`, applicationData),
  deleteApplication: (id) => api.delete(`/recruitment/applications/${id}`),
  
  getRecruitmentStats: () => api.get('/recruitment/stats'),
};

export const performanceAPI = {
  getPerformanceReviews: (params) => api.get('/performance/reviews', { params }),
  getPerformanceReview: (id) => api.get(`/performance/reviews/${id}`),
  createPerformanceReview: (reviewData) => api.post('/performance/reviews', reviewData),
  updatePerformanceReview: (id, reviewData) => api.put(`/performance/reviews/${id}`, reviewData),
  deletePerformanceReview: (id) => api.delete(`/performance/reviews/${id}`),
  
  getGoals: (params) => api.get('/performance/goals', { params }),
  getGoal: (id) => api.get(`/performance/goals/${id}`),
  createGoal: (goalData) => api.post('/performance/goals', goalData),
  updateGoal: (id, goalData) => api.put(`/performance/goals/${id}`, goalData),
  deleteGoal: (id) => api.delete(`/performance/goals/${id}`),
  
  getPerformanceStats: () => api.get('/performance/stats'),
};

export const leaveAPI = {
  getLeaveRequests: (params) => api.get('/leave/requests', { params }),
  getLeaveRequest: (id) => api.get(`/leave/requests/${id}`),
  createLeaveRequest: (leaveData) => api.post('/leave/requests', leaveData),
  updateLeaveRequest: (id, leaveData) => api.put(`/leave/requests/${id}`, leaveData),
  deleteLeaveRequest: (id) => api.delete(`/leave/requests/${id}`),
  approveLeaveRequest: (id) => api.put(`/leave/requests/${id}/approve`),
  rejectLeaveRequest: (id, reason) => api.put(`/leave/requests/${id}/reject`, { reason }),
  
  getLeaveBalance: (employeeId) => api.get(`/leave/balance/${employeeId}`),
  getLeaveStats: () => api.get('/leave/stats'),
};

export const trainingAPI = {
  getTrainingPrograms: (params) => api.get('/training/programs', { params }),
  getTrainingProgram: (id) => api.get(`/training/programs/${id}`),
  createTrainingProgram: (programData) => api.post('/training/programs', programData),
  updateTrainingProgram: (id, programData) => api.put(`/training/programs/${id}`, programData),
  deleteTrainingProgram: (id) => api.delete(`/training/programs/${id}`),
  
  enrollInProgram: (programId) => api.post(`/training/programs/${programId}/enroll`),
  getEnrollments: (params) => api.get('/training/enrollments', { params }),
  updateEnrollmentProgress: (enrollmentId, progress) => 
    api.put(`/training/enrollments/${enrollmentId}/progress`, { progress }),
  
  getTrainingStats: () => api.get('/training/stats'),
};

export const aiAPI = {
  analyzeResume: (formData) => api.post('/ai/analyze-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  screenApplications: (data) => api.post('/ai/screen-applications', data),
  predictPerformance: (employeeId) => api.post('/ai/predict-performance', { employeeId }),
  analyzeSkillGaps: (data) => api.post('/ai/analyze-skill-gaps', data),
  analyzeSentiment: (text, context) => api.post('/ai/sentiment-analysis', { text, context }),
  getAIInsights: (employeeId) => api.get(`/ai/insights/${employeeId}`),
  getAIStatus: () => api.get('/ai/status'),
  batchProcess: (tasks) => api.post('/ai/batch-process', { tasks }),
};

export const chatbotAPI = {
  sendMessage: (message, conversationId) => api.post('/chatbot/message', { message, conversationId }),
  getConversation: (conversationId) => api.get(`/chatbot/conversation/${conversationId}`),
  clearConversation: (conversationId) => api.delete(`/chatbot/conversation/${conversationId}`),
  getSuggestions: () => api.get('/chatbot/suggestions'),
  provideFeedback: (data) => api.post('/chatbot/feedback', data),
  getAnalytics: () => api.get('/chatbot/analytics'),
  trainChatbot: (trainingData) => api.post('/chatbot/train', { trainingData }),
};

export const dashboardAPI = {
  getOverviewStats: () => api.get('/dashboard/overview'),
  getRecentActivities: () => api.get('/dashboard/activities'),
  getUpcomingEvents: () => api.get('/dashboard/events'),
  getPerformanceMetrics: () => api.get('/dashboard/performance-metrics'),
  getEmployeeDistribution: () => api.get('/dashboard/employee-distribution'),
  getRecruitmentFunnel: () => api.get('/dashboard/recruitment-funnel'),
};

// File upload helper
export const uploadFile = (file, endpoint, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Utility functions
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export const exportData = (endpoint, filename, params = {}) => {
  return api.get(endpoint, {
    params: { ...params, export: true },
    responseType: 'blob',
  }).then((response) => {
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  });
};

export default api;