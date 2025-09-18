const tf = require('@tensorflow/tfjs');
const natural = require('natural');
const compromise = require('compromise');
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');

class AIService {
  constructor() {
    this.openai = null;
    this.resumeModel = null;
    this.performanceModel = null;
    this.initialized = false;
    
    // NLP tools
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.sentiment = new natural.SentimentAnalyzer('English', 
      natural.PorterStemmer, 'afinn');
    
    // Skill categories for better matching
    this.skillCategories = {
      programming: ['javascript', 'python', 'java', 'c++', 'react', 'node.js', 'angular', 'vue'],
      database: ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch'],
      cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes'],
      design: ['figma', 'sketch', 'photoshop', 'illustrator', 'ui/ux'],
      management: ['project management', 'agile', 'scrum', 'leadership', 'team management']
    };
  }

  async initialize() {
    try {
      console.log('🤖 Initializing AI Service...');
      
      // Initialize OpenAI if API key is provided
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        console.log('✅ OpenAI initialized');
      }
      
      // Load or create ML models
      await this.initializeModels();
      
      this.initialized = true;
      console.log('✅ AI Service initialized successfully');
    } catch (error) {
      console.error('❌ AI Service initialization failed:', error);
    }
  }

  async initializeModels() {
    try {
      // Initialize resume screening model
      this.resumeModel = await this.createResumeScreeningModel();
      
      // Initialize performance prediction model
      this.performanceModel = await this.createPerformancePredictionModel();
      
      console.log('✅ ML Models initialized');
    } catch (error) {
      console.error('❌ Model initialization failed:', error);
    }
  }

  async createResumeScreeningModel() {
    // Simple neural network for resume screening
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [50], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async createPerformancePredictionModel() {
    // Neural network for performance prediction
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [30], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  // Resume Analysis and Screening
  async analyzeResume(resumeText, jobRequirements) {
    try {
      const analysis = {
        overallScore: 0,
        skillsMatch: 0,
        experienceMatch: 0,
        educationMatch: 0,
        keywordMatch: 0,
        strengths: [],
        weaknesses: [],
        recommendations: [],
        confidence: 0
      };

      // Extract information from resume
      const extractedInfo = await this.extractResumeInformation(resumeText);
      
      // Calculate skill matching
      analysis.skillsMatch = this.calculateSkillsMatch(extractedInfo.skills, jobRequirements.skills);
      
      // Calculate experience matching
      analysis.experienceMatch = this.calculateExperienceMatch(extractedInfo.experience, jobRequirements.experience);
      
      // Calculate education matching
      analysis.educationMatch = this.calculateEducationMatch(extractedInfo.education, jobRequirements.education);
      
      // Calculate keyword matching
      analysis.keywordMatch = this.calculateKeywordMatch(resumeText, jobRequirements.keywords);
      
      // Calculate overall score
      analysis.overallScore = Math.round(
        (analysis.skillsMatch * 0.4 + 
         analysis.experienceMatch * 0.3 + 
         analysis.educationMatch * 0.2 + 
         analysis.keywordMatch * 0.1) * 100
      );

      // Generate insights
      analysis.strengths = this.identifyStrengths(extractedInfo, jobRequirements);
      analysis.weaknesses = this.identifyWeaknesses(extractedInfo, jobRequirements);
      analysis.recommendations = this.generateRecommendations(analysis);
      analysis.confidence = this.calculateConfidence(analysis);

      return analysis;
    } catch (error) {
      console.error('Resume analysis error:', error);
      throw error;
    }
  }

  async extractResumeInformation(resumeText) {
    const doc = compromise(resumeText);
    
    return {
      skills: this.extractSkills(resumeText),
      experience: this.extractExperience(doc),
      education: this.extractEducation(doc),
      contact: this.extractContactInfo(resumeText),
      summary: this.extractSummary(resumeText)
    };
  }

  extractSkills(text) {
    const skills = [];
    const lowerText = text.toLowerCase();
    
    // Check against known skill categories
    Object.values(this.skillCategories).flat().forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        skills.push({
          name: skill,
          category: this.getSkillCategory(skill),
          confidence: this.calculateSkillConfidence(text, skill)
        });
      }
    });
    
    return skills;
  }

  extractExperience(doc) {
    const experiences = [];
    const sentences = doc.sentences().out('array');
    
    sentences.forEach(sentence => {
      // Look for experience patterns
      if (this.isExperiencePattern(sentence)) {
        experiences.push({
          description: sentence,
          duration: this.extractDuration(sentence),
          company: this.extractCompany(sentence)
        });
      }
    });
    
    return experiences;
  }

  extractEducation(doc) {
    const education = [];
    const sentences = doc.sentences().out('array');
    
    sentences.forEach(sentence => {
      if (this.isEducationPattern(sentence)) {
        education.push({
          degree: this.extractDegree(sentence),
          institution: this.extractInstitution(sentence),
          year: this.extractYear(sentence)
        });
      }
    });
    
    return education;
  }

  // Performance Prediction
  async predictPerformance(employeeData) {
    try {
      if (!this.performanceModel) {
        throw new Error('Performance model not initialized');
      }

      const features = this.extractPerformanceFeatures(employeeData);
      const prediction = await this.performanceModel.predict(tf.tensor2d([features])).data();
      
      return {
        score: Math.round(prediction[0] * 100),
        factors: this.identifyPerformanceFactors(employeeData, features),
        recommendations: this.generatePerformanceRecommendations(employeeData, prediction[0]),
        confidence: this.calculatePredictionConfidence(features)
      };
    } catch (error) {
      console.error('Performance prediction error:', error);
      throw error;
    }
  }

  extractPerformanceFeatures(employeeData) {
    // Extract 30 features for performance prediction
    const features = new Array(30).fill(0);
    
    // Experience-related features (0-9)
    features[0] = Math.min(employeeData.yearsOfExperience || 0, 20) / 20;
    features[1] = (employeeData.skills?.length || 0) / 50;
    features[2] = employeeData.educationLevel || 0;
    features[3] = employeeData.certifications?.length || 0;
    features[4] = employeeData.previousRatings?.average || 0;
    
    // Behavioral features (10-19)
    features[10] = employeeData.attendanceRate || 0.95;
    features[11] = employeeData.projectCompletionRate || 0.8;
    features[12] = employeeData.teamworkScore || 0.7;
    features[13] = employeeData.communicationScore || 0.7;
    features[14] = employeeData.leadershipScore || 0.5;
    
    // Engagement features (20-29)
    features[20] = employeeData.trainingHours || 0;
    features[21] = employeeData.feedbackScore || 0.7;
    features[22] = employeeData.goalAchievementRate || 0.8;
    features[23] = employeeData.innovationScore || 0.5;
    features[24] = employeeData.adaptabilityScore || 0.7;
    
    return features;
  }

  // Chatbot and NLP
  async processNaturalLanguageQuery(query, context = {}) {
    try {
      const intent = await this.classifyIntent(query);
      const entities = this.extractEntities(query);
      
      let response;
      
      switch (intent.category) {
        case 'leave_request':
          response = await this.handleLeaveQuery(query, entities, context);
          break;
        case 'performance_inquiry':
          response = await this.handlePerformanceQuery(query, entities, context);
          break;
        case 'policy_question':
          response = await this.handlePolicyQuery(query, entities, context);
          break;
        case 'general_hr':
          response = await this.handleGeneralHRQuery(query, entities, context);
          break;
        default:
          response = await this.handleGenericQuery(query, context);
      }
      
      return {
        response,
        intent,
        entities,
        confidence: intent.confidence
      };
    } catch (error) {
      console.error('NLP processing error:', error);
      return {
        response: "I'm sorry, I couldn't understand your query. Please try rephrasing or contact HR directly.",
        intent: { category: 'unknown', confidence: 0 },
        entities: [],
        confidence: 0
      };
    }
  }

  async classifyIntent(query) {
    const lowerQuery = query.toLowerCase();
    
    // Simple rule-based intent classification
    const intents = [
      {
        category: 'leave_request',
        keywords: ['leave', 'vacation', 'time off', 'sick', 'holiday', 'absence'],
        confidence: 0
      },
      {
        category: 'performance_inquiry',
        keywords: ['performance', 'review', 'rating', 'evaluation', 'feedback'],
        confidence: 0
      },
      {
        category: 'policy_question',
        keywords: ['policy', 'rule', 'procedure', 'guideline', 'handbook'],
        confidence: 0
      },
      {
        category: 'general_hr',
        keywords: ['hr', 'human resources', 'payroll', 'benefits', 'salary'],
        confidence: 0
      }
    ];
    
    // Calculate confidence for each intent
    intents.forEach(intent => {
      const matches = intent.keywords.filter(keyword => lowerQuery.includes(keyword));
      intent.confidence = matches.length / intent.keywords.length;
    });
    
    // Return intent with highest confidence
    const bestIntent = intents.reduce((prev, current) => 
      prev.confidence > current.confidence ? prev : current
    );
    
    return bestIntent.confidence > 0.3 ? bestIntent : { category: 'unknown', confidence: 0 };
  }

  extractEntities(query) {
    const doc = compromise(query);
    
    return {
      dates: doc.dates().out('array'),
      people: doc.people().out('array'),
      places: doc.places().out('array'),
      organizations: doc.organizations().out('array'),
      numbers: doc.values().out('array')
    };
  }

  // Sentiment Analysis
  analyzeSentiment(text) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));
    
    // Simple sentiment scoring
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'frustrating'];
    
    let score = 0;
    stemmedTokens.forEach(token => {
      if (positiveWords.includes(token)) score += 1;
      if (negativeWords.includes(token)) score -= 1;
    });
    
    const normalizedScore = Math.max(-1, Math.min(1, score / tokens.length * 10));
    
    return {
      score: normalizedScore,
      sentiment: normalizedScore > 0.1 ? 'positive' : normalizedScore < -0.1 ? 'negative' : 'neutral',
      confidence: Math.abs(normalizedScore),
      tokens: stemmedTokens
    };
  }

  // Skill Gap Analysis
  async analyzeSkillGaps(employee, targetRole) {
    const currentSkills = employee.skills || [];
    const requiredSkills = targetRole.skills || [];
    
    const gaps = [];
    const strengths = [];
    
    requiredSkills.forEach(required => {
      const current = currentSkills.find(skill => 
        skill.name.toLowerCase() === required.name.toLowerCase()
      );
      
      if (!current) {
        gaps.push({
          skill: required.name,
          importance: required.importance || 'medium',
          currentLevel: 'none',
          targetLevel: required.level,
          priority: this.calculateSkillPriority(required)
        });
      } else if (this.getSkillLevelValue(current.level) < this.getSkillLevelValue(required.level)) {
        gaps.push({
          skill: required.name,
          importance: required.importance || 'medium',
          currentLevel: current.level,
          targetLevel: required.level,
          priority: this.calculateSkillPriority(required)
        });
      } else {
        strengths.push({
          skill: current.name,
          level: current.level,
          advantage: this.getSkillLevelValue(current.level) - this.getSkillLevelValue(required.level)
        });
      }
    });
    
    return {
      gaps: gaps.sort((a, b) => b.priority - a.priority),
      strengths,
      recommendations: this.generateSkillRecommendations(gaps),
      timeline: this.estimateSkillDevelopmentTimeline(gaps)
    };
  }

  // Helper methods
  calculateSkillsMatch(candidateSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return 1;
    
    let totalWeight = 0;
    let matchedWeight = 0;
    
    requiredSkills.forEach(required => {
      const weight = required.mandatory ? 2 : 1;
      totalWeight += weight;
      
      const candidate = candidateSkills.find(skill => 
        skill.name.toLowerCase() === required.name.toLowerCase()
      );
      
      if (candidate) {
        const levelMatch = this.getSkillLevelMatch(candidate.level, required.level);
        matchedWeight += weight * levelMatch;
      }
    });
    
    return totalWeight > 0 ? matchedWeight / totalWeight : 0;
  }

  getSkillLevelMatch(candidateLevel, requiredLevel) {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const candidate = levels[candidateLevel] || 0;
    const required = levels[requiredLevel] || 1;
    
    return candidate >= required ? 1 : candidate / required;
  }

  getSkillLevelValue(level) {
    const values = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    return values[level] || 0;
  }

  calculateSkillPriority(skill) {
    const importanceWeight = { high: 3, medium: 2, low: 1 };
    const mandatoryWeight = skill.mandatory ? 2 : 1;
    return (importanceWeight[skill.importance] || 2) * mandatoryWeight;
  }

  generateSkillRecommendations(gaps) {
    return gaps.slice(0, 5).map(gap => ({
      skill: gap.skill,
      action: this.getRecommendedAction(gap),
      resources: this.getSkillResources(gap.skill),
      timeline: this.estimateSkillTimeline(gap)
    }));
  }

  getRecommendedAction(gap) {
    if (gap.currentLevel === 'none') {
      return `Start learning ${gap.skill} fundamentals`;
    }
    return `Advance ${gap.skill} from ${gap.currentLevel} to ${gap.targetLevel}`;
  }

  // OpenAI Integration
  async generateAIResponse(prompt, context = {}) {
    if (!this.openai) {
      return "AI service not available. Please configure OpenAI API key.";
    }
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant for NextTechFusionGadgets HRMS. Provide helpful, professional responses about HR-related queries."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
    }
  }

  // Utility methods
  isInitialized() {
    return this.initialized;
  }

  getServiceStatus() {
    return {
      initialized: this.initialized,
      openaiAvailable: !!this.openai,
      modelsLoaded: !!(this.resumeModel && this.performanceModel)
    };
  }
}

// Export singleton instance
module.exports = new AIService();