require('dotenv').config();
const express = require('express');
const cors = require('cors');
const leecoAdapter = require('./leecoAdapter');
const openAiAdapter = require('./openAiAdapter');
const dsaHelper = require('./models/dsaHelper');
const interviewAnalyzer = require('./models/interviewAnalyzer');
const resumeAnalyzer = require('./models/resumeAnalyzer');

const app = express();
const PORT = process.env.AI_SERVICE_PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SkillSync AI Services',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// DSA Code Analysis Routes
app.post('/api/dsa/analyze-code', async (req, res) => {
  try {
    const { code, language, questionId } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    const analysis = await dsaHelper.analyzeCode(code, language, questionId);
    res.json(analysis);
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ message: 'Code analysis failed', error: error.message });
  }
});

app.post('/api/dsa/generate-hint', async (req, res) => {
  try {
    const { questionId, difficulty } = req.body;

    if (!questionId) {
      return res.status(400).json({ message: 'Question ID is required' });
    }

    const hint = await dsaHelper.generateHint(questionId, difficulty);
    res.json({ hint });
  } catch (error) {
    console.error('Hint generation error:', error);
    res.status(500).json({ message: 'Hint generation failed', error: error.message });
  }
});

app.post('/api/dsa/explain-solution', async (req, res) => {
  try {
    const { code, language, approach } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    const explanation = await dsaHelper.explainSolution(code, language, approach);
    res.json({ explanation });
  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ message: 'Explanation failed', error: error.message });
  }
});

// Interview Analysis Routes
app.post('/api/interview/analyze-answer', async (req, res) => {
  try {
    const { answer, question, sessionType } = req.body;

    if (!answer || !question) {
      return res.status(400).json({ message: 'Answer and question are required' });
    }

    const analysis = await interviewAnalyzer.analyzeAnswer(answer, question, sessionType);
    res.json(analysis);
  } catch (error) {
    console.error('Answer analysis error:', error);
    res.status(500).json({ message: 'Answer analysis failed', error: error.message });
  }
});

app.post('/api/interview/generate-followup', async (req, res) => {
  try {
    const { answer, question, sessionType } = req.body;

    if (!answer || !question) {
      return res.status(400).json({ message: 'Answer and question are required' });
    }

    const followUp = await interviewAnalyzer.generateFollowUp(answer, question, sessionType);
    res.json({ followUp });
  } catch (error) {
    console.error('Follow-up generation error:', error);
    res.status(500).json({ message: 'Follow-up generation failed', error: error.message });
  }
});

app.post('/api/interview/evaluate-session', async (req, res) => {
  try {
    const { answers, questions, sessionType } = req.body;

    if (!answers || !questions) {
      return res.status(400).json({ message: 'Answers and questions are required' });
    }

    const evaluation = await interviewAnalyzer.evaluateSession(answers, questions, sessionType);
    res.json(evaluation);
  } catch (error) {
    console.error('Session evaluation error:', error);
    res.status(500).json({ message: 'Session evaluation failed', error: error.message });
  }
});

// Resume Analysis Routes
app.post('/api/resume/analyze', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: 'Resume text is required' });
    }

    const analysis = await resumeAnalyzer.analyzeResume(resumeText, jobDescription);
    res.json(analysis);
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: 'Resume analysis failed', error: error.message });
  }
});

app.post('/api/resume/improve-section', async (req, res) => {
  try {
    const { section, content } = req.body;

    if (!section || !content) {
      return res.status(400).json({ message: 'Section and content are required' });
    }

    const improved = await resumeAnalyzer.improveSection(section, content);
    res.json({ improved });
  } catch (error) {
    console.error('Section improvement error:', error);
    res.status(500).json({ message: 'Section improvement failed', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Unknown error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SkillSync AI Services running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
