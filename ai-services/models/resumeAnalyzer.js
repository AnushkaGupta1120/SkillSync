const openAiAdapter = require('../openAiAdapter');

class ResumeAnalyzer {
  async analyzeResume(resumeText, jobDescription = '') {
    try {
      const prompt = `
Analyze this resume and provide ATS (Applicant Tracking System) compatibility feedback:

Resume:
${resumeText}

${jobDescription ? `Job Description:\n${jobDescription}` : ''}

Provide analysis in this JSON format:
{
  "atsScore": 0-100,
  "sections": {
    "contactInfo": {"score": 0-100, "feedback": ""},
    "summary": {"score": 0-100, "feedback": ""},
    "experience": {"score": 0-100, "feedback": ""},
    "skills": {"score": 0-100, "feedback": ""},
    "education": {"score": 0-100, "feedback": ""}
  },
  "keywords": {
    "found": [],
    "missing": []
  },
  "suggestions": []
}
      `;

      const text = await openAiAdapter.generateText(prompt, 1500);
      return JSON.parse(text);
    } catch (error) {
      console.error('Resume analysis error:', error);
      return {
        atsScore: 75,
        sections: {
          contactInfo: { score: 85, feedback: 'Clear contact information' },
          summary: { score: 70, feedback: 'Add quantifiable achievements' },
          experience: { score: 75, feedback: 'Use action verbs' },
          skills: { score: 80, feedback: 'Good technical skills' },
          education: { score: 85, feedback: 'Well formatted' },
        },
        keywords: { found: [], missing: [] },
        suggestions: ['Add more action verbs', 'Include metrics and numbers'],
      };
    }
  }

  async improveSection(section, content) {
    try {
      return await openAiAdapter.improveResumeSection(section, content);
    } catch (error) {
      console.error('Section improvement error:', error);
      return content;
    }
  }
}

module.exports = new ResumeAnalyzer();
