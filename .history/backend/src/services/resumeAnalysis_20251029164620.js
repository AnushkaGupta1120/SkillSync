const axios = require('axios');

class ResumeAnalysisService {
  constructor() {
    this.aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';
  }

  async analyzeResume(resumeText, targetRole = 'Software Engineer', jobDescription = '') {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/resume/analyze`, {
        resumeText,
        targetRole,
        jobDescription
      }, {
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('AI resume analysis failed:', error.message);
      
      // Fallback to basic analysis if AI service is unavailable
      return this.performBasicAnalysis(resumeText, targetRole);
    }
  }

  async optimizeResume(resumeText, targetRole, jobDescription, focusAreas = []) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/resume/optimize`, {
        resumeText,
        targetRole,
        jobDescription,
        focusAreas
      }, {
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('AI resume optimization failed:', error.message);
      
      // Fallback to basic optimization suggestions
      return this.generateBasicOptimizations(resumeText, targetRole);
    }
  }

  performBasicAnalysis(resumeText, targetRole) {
    const analysis = {
      atsScore: this.calculateATSScore(resumeText),
      overallScore: this.calculateOverallScore(resumeText),
      strengths: this.identifyStrengths(resumeText),
      improvements: this.identifyImprovements(resumeText),
      sections: this.analyzeSections(resumeText),
      keywords: this.analyzeKeywords(resumeText, targetRole),
      formatting: this.analyzeFormatting(resumeText)
    };

    return analysis;
  }

  calculateATSScore(resumeText) {
    let score = 50; // Base score

    // Check for contact information
    if (this.hasContactInfo(resumeText)) score += 10;
    
    // Check for professional summary
    if (this.hasProfessionalSummary(resumeText)) score += 10;
    
    // Check for work experience
    if (this.hasWorkExperience(resumeText)) score += 15;
    
    // Check for education
    if (this.hasEducation(resumeText)) score += 10;
    
    // Check for skills section
    if (this.hasSkillsSection(resumeText)) score += 5;

    return Math.min(score, 100);
  }

  calculateOverallScore(resumeText) {
    let score = 60; // Base score

    // Check for quantified achievements
    if (this.hasQuantifiedAchievements(resumeText)) score += 15;
    
    // Check for action verbs
    if (this.hasActionVerbs(resumeText)) score += 10;
    
    // Check for relevant keywords
    if (this.hasRelevantKeywords(resumeText)) score += 15;

    return Math.min(score, 100);
  }

  identifyStrengths(resumeText) {
    const strengths = [];
    
    if (this.hasContactInfo(resumeText)) {
      strengths.push('Complete contact information provided');
    }
    
    if (this.hasProfessionalSummary(resumeText)) {
      strengths.push('Professional summary present');
    }
    
    if (this.hasQuantifiedAchievements(resumeText)) {
      strengths.push('Includes quantified achievements');
    }
    
    if (this.hasRelevantKeywords(resumeText)) {
      strengths.push('Contains relevant industry keywords');
    }

    return strengths.length > 0 ? strengths : ['Resume structure is present'];
  }

  identifyImprovements(resumeText) {
    const improvements = [];
    
    if (!this.hasQuantifiedAchievements(resumeText)) {
      improvements.push('Add more quantified achievements with specific numbers');
    }
    
    if (!this.hasActionVerbs(resumeText)) {
      improvements.push('Use more action verbs to describe experiences');
    }
    
    if (!this.hasRelevantKeywords(resumeText)) {
      improvements.push('Include more relevant industry keywords');
    }
    
    improvements.push('Ensure consistent formatting throughout');
    improvements.push('Tailor content to match job requirements');

    return improvements;
  }

  analyzeSections(resumeText) {
    const sections = [];
    
    sections.push({
      name: 'Contact Information',
      score: this.hasContactInfo(resumeText) ? 90 : 60,
      feedback: this.hasContactInfo(resumeText) ? 
        'Contact information is complete' : 
        'Missing some contact information',
      suggestions: this.hasContactInfo(resumeText) ? 
        ['Consider adding LinkedIn profile'] : 
        ['Add phone number', 'Add email address', 'Add location']
    });

    sections.push({
      name: 'Professional Summary',
      score: this.hasProfessionalSummary(resumeText) ? 75 : 40,
      feedback: this.hasProfessionalSummary(resumeText) ? 
        'Professional summary is present' : 
        'Missing professional summary',
      suggestions: this.hasProfessionalSummary(resumeText) ? 
        ['Make it more specific to the target role'] : 
        ['Add a professional summary section', 'Highlight key achievements']
    });

    sections.push({
      name: 'Work Experience',
      score: this.hasWorkExperience(resumeText) ? 80 : 30,
      feedback: this.hasWorkExperience(resumeText) ? 
        'Work experience section is present' : 
        'Work experience needs improvement',
      suggestions: this.hasWorkExperience(resumeText) ? 
        ['Add more quantified results', 'Use action verbs'] : 
        ['Add relevant work experience', 'Include internships if applicable']
    });

    return sections;
  }

  analyzeKeywords(resumeText, targetRole) {
    const techKeywords = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS',
      'SQL', 'Git', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'TypeScript'
    ];

    const found = techKeywords.filter(keyword => 
      resumeText.toLowerCase().includes(keyword.toLowerCase())
    );

    const missing = techKeywords.filter(keyword => 
      !resumeText.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 5);

    return {
      found,
      missing,
      suggestions: [
        'Add cloud platform experience (AWS, Azure, GCP)',
        'Include testing frameworks and methodologies',
        'Mention DevOps tools and practices',
        'Add database technologies',
        'Include relevant soft skills'
      ]
    };
  }

  analyzeFormatting(resumeText) {
    return {
      score: 75,
      issues: [
        'Some sections may have inconsistent formatting',
        'Consider using bullet points for better readability'
      ],
      recommendations: [
        'Use consistent font and sizing',
        'Maintain proper spacing between sections',
        'Use bullet points for achievements',
        'Keep margins balanced',
        'Ensure proper section headings'
      ]
    };
  }

  generateBasicOptimizations(resumeText, targetRole) {
    return {
      suggestions: [
        {
          section: 'Professional Summary',
          priority: 'High',
          current: 'Generic professional summary',
          improved: `Results-driven ${targetRole} with proven track record of delivering high-quality solutions`,
          reason: 'More specific and role-targeted'
        },
        {
          section: 'Work Experience',
          priority: 'High',
          current: 'Worked on various projects',
          improved: 'Led development of 3 major projects, improving system performance by 40%',
          reason: 'Added specific metrics and leadership emphasis'
        }
      ],
      keywordOptimization: [
        `Include "${targetRole}" in professional summary`,
        'Add relevant technical skills',
        'Mention industry-standard tools and frameworks',
        'Include project management methodologies'
      ],
      atsOptimization: [
        'Use standard section headings',
        'Avoid unusual fonts or formatting',
        'Include relevant keywords naturally',
        'Save in both PDF and Word formats'
      ]
    };
  }

  // Helper methods for text analysis
  hasContactInfo(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+\d{1,3}[- ]?)?\d{10}|\(\d{3}\)\s*\d{3}[- ]?\d{4}/;
    return emailRegex.test(text) || phoneRegex.test(text);
  }

  hasProfessionalSummary(text) {
    const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
    return summaryKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  hasWorkExperience(text) {
    const experienceKeywords = ['experience', 'employment', 'work', 'position'];
    return experienceKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  hasEducation(text) {
    const educationKeywords = ['education', 'degree', 'university', 'college'];
    return educationKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  hasSkillsSection(text) {
    const skillsKeywords = ['skills', 'technologies', 'technical'];
    return skillsKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    );
  }

  hasQuantifiedAchievements(text) {
    const numberRegex = /\d+[%$]?|\d+\+/g;
    const matches = text.match(numberRegex);
    return matches && matches.length >= 3;
  }

  hasActionVerbs(text) {
    const actionVerbs = [
      'developed', 'implemented', 'created', 'designed', 'built', 'managed',
      'led', 'improved', 'optimized', 'achieved', 'delivered', 'launched'
    ];
    
    return actionVerbs.some(verb => 
      text.toLowerCase().includes(verb)
    );
  }

  hasRelevantKeywords(text) {
    const keywords = [
      'javascript', 'python', 'react', 'node', 'sql', 'git', 'aws',
      'agile', 'scrum', 'api', 'database', 'testing'
    ];
    
    const found = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    return found.length >= 3;
  }
}

module.exports = new ResumeAnalysisService();
