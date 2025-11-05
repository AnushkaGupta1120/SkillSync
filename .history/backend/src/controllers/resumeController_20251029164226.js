const { query } = require('../config/mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

const uploadResume = upload.single('resume');

const analyzeResume = async (req, res) => {
  try {
    uploadResume(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Resume file is required' });
      }

      const userId = req.user.id;
      const { targetRole = 'Software Engineer', jobDescription = '' } = req.body;

      try {
        // Extract text from file (simplified - use proper PDF/DOC parsers in production)
        const resumeText = await extractTextFromFile(req.file.path);

        // Generate mock analysis (integrate with AI service in production)
        const analysis = await generateResumeAnalysis(resumeText, targetRole, jobDescription);

        // Save analysis to database
        const analysisId = await query(
          `INSERT INTO resume_analyses (user_id, file_url, file_name, analysis_results, ats_score, suggestions) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            req.file.path,
            req.file.originalname,
            JSON.stringify(analysis),
            analysis.atsScore,
            JSON.stringify(analysis.suggestions || [])
          ]
        );

        res.json({
          id: analysisId.insertId,
          ...analysis,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          analyzedAt: new Date().toISOString()
        });

      } catch (analysisError) {
        // Clean up uploaded file on error
        await fs.unlink(req.file.path).catch(console.error);
        throw analysisError;
      }
    });

  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAnalysisHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const analyses = await query(
      `SELECT id, file_name, ats_score, analyzed_at, analysis_results
       FROM resume_analyses 
       WHERE user_id = ? 
       ORDER BY analyzed_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      analyses: analyses.map(analysis => ({
        id: analysis.id,
        fileName: analysis.file_name,
        atsScore: analysis.ats_score,
        analyzedAt: analysis.analyzed_at,
        summary: JSON.parse(analysis.analysis_results || '{}').summary || 'Analysis completed'
      })),
      hasMore: analyses.length === parseInt(limit)
    });

  } catch (error) {
    console.error('Get analysis history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAnalysisDetails = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user.id;

    const analyses = await query(
      'SELECT * FROM resume_analyses WHERE id = ? AND user_id = ?',
      [analysisId, userId]
    );

    if (analyses.length === 0) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    const analysis = analyses;

    res.json({
      id: analysis.id,
      fileName: analysis.file_name,
      atsScore: analysis.ats_score,
      analyzedAt: analysis.analyzed_at,
      ...JSON.parse(analysis.analysis_results || '{}'),
      suggestions: JSON.parse(analysis.suggestions || '[]')
    });

  } catch (error) {
    console.error('Get analysis details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const optimizeResume = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { targetRole, jobDescription, focusAreas } = req.body;
    const userId = req.user.id;

    // Get existing analysis
    const analyses = await query(
      'SELECT * FROM resume_analyses WHERE id = ? AND user_id = ?',
      [analysisId, userId]
    );

    if (analyses.length === 0) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    const analysis = analyses;
    const existingResults = JSON.parse(analysis.analysis_results || '{}');

    // Generate optimization suggestions (integrate with AI service)
    const optimization = await generateOptimizationSuggestions(
      existingResults,
      targetRole,
      jobDescription,
      focusAreas
    );

    // Update analysis with optimization
    await query(
      'UPDATE resume_analyses SET suggestions = ?, updated_at = NOW() WHERE id = ?',
      [JSON.stringify(optimization.suggestions), analysisId]
    );

    res.json(optimization);

  } catch (error) {
    console.error('Resume optimization error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const downloadAnalysisReport = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user.id;

    const analyses = await query(
      'SELECT * FROM resume_analyses WHERE id = ? AND user_id = ?',
      [analysisId, userId]
    );

    if (analyses.length === 0) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    const analysis = analyses;
    const results = JSON.parse(analysis.analysis_results || '{}');

    // Generate PDF report (simplified - use proper PDF generation in production)
    const reportData = {
      fileName: analysis.file_name,
      atsScore: analysis.ats_score,
      analyzedAt: analysis.analyzed_at,
      ...results
    };

    res.json({
      message: 'Report generation completed',
      downloadUrl: `/api/resume/download/${analysisId}`,
      reportData
    });

  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper functions
const extractTextFromFile = async (filePath) => {
  // Simplified text extraction - use proper libraries like pdf-parse, mammoth in production
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.pdf') {
    // Mock PDF text extraction
    return "Sample resume text extracted from PDF. Software Engineer with 3+ years of experience in React, Node.js, and MongoDB. Strong problem-solving skills and experience in agile development.";
  } else if (ext === '.doc' || ext === '.docx') {
    // Mock DOC text extraction
    return "Sample resume text extracted from Word document. Full-stack developer with expertise in JavaScript, Python, and cloud technologies.";
  }
  
  return "Unable to extract text from file";
};

const generateResumeAnalysis = async (resumeText, targetRole, jobDescription) => {
  // Mock analysis - integrate with AI service in production
  const atsScore = Math.floor(Math.random() * 30) + 70; // 70-100
  const overallScore = Math.floor(Math.random() * 25) + 75; // 75-100

  return {
    atsScore,
    overallScore,
    strengths: [
      'Clear contact information and professional summary',
      'Relevant technical skills listed',
      'Good work experience progression',
      'Education section is complete'
    ],
    improvements: [
      'Add more quantified achievements',
      'Include relevant keywords for ATS optimization',
      'Improve formatting consistency',
      'Add project descriptions with impact metrics'
    ],
    sections: [
      {
        name: 'Contact Information',
        score: 95,
        feedback: 'Complete and professional contact information',
        suggestions: ['Consider adding LinkedIn profile URL']
      },
      {
        name: 'Professional Summary',
        score: atsScore,
        feedback: 'Good summary but could be more targeted',
        suggestions: ['Include specific years of experience', 'Add key achievements']
      },
      {
        name: 'Work Experience',
        score: overallScore - 5,
        feedback: 'Relevant experience but needs more quantified results',
        suggestions: ['Add metrics and percentages', 'Use action verbs', 'Include project impacts']
      },
      {
        name: 'Technical Skills',
        score: 85,
        feedback: 'Good skill variety',
        suggestions: ['Organize by proficiency level', 'Add relevant frameworks']
      },
      {
        name: 'Education',
        score: 90,
        feedback: 'Education section is complete',
        suggestions: ['Add relevant coursework if recent graduate']
      }
    ],
    keywords: {
      found: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Agile'],
      missing: ['TypeScript', 'AWS', 'Docker', 'Testing', 'CI/CD'],
      suggestions: ['Add cloud platforms', 'Include testing frameworks', 'Mention DevOps tools']
    },
    formatting: {
      score: atsScore - 10,
      issues: ['Inconsistent spacing in some sections', 'Mixed bullet point styles'],
      recommendations: [
        'Use consistent formatting throughout',
        'Ensure proper margins and spacing',
        'Use standard fonts (Arial, Calibri)',
        'Keep file size under 1MB',
        'Use standard section headings'
      ]
    },
    summary: `Your resume shows good potential with an ATS score of ${atsScore}%. Focus on adding quantified achievements and optimizing keywords for better performance.`
  };
};

const generateOptimizationSuggestions = async (existingResults, targetRole, jobDescription, focusAreas) => {
  // Mock optimization - integrate with AI service in production
  return {
    suggestions: [
      {
        section: 'Professional Summary',
        priority: 'High',
        current: 'Software Engineer with experience in web development...',
        improved: `Results-driven ${targetRole} with 3+ years of experience delivering scalable web applications using React, Node.js, and cloud technologies. Proven track record of improving system performance by 40% and reducing deployment time by 60%.`,
        reason: 'More specific, quantified, and targeted to the role'
      },
      {
        section: 'Work Experience',
        priority: 'High',
        current: 'Developed web applications using React and Node.js',
        improved: 'Built and deployed 5+ responsive web applications using React and Node.js, serving 10,000+ daily users and achieving 99.9% uptime',
        reason: 'Added specific metrics and impact'
      },
      {
        section: 'Technical Skills',
        priority: 'Medium',
        current: 'JavaScript, React, Node.js',
        improved: 'JavaScript (ES6+), React.js, Node.js, TypeScript, AWS (EC2, S3, Lambda), Docker, Jest, MongoDB',
        reason: 'Added trending technologies and organized by category'
      }
    ],
    keywordOptimization: [
      `Add "${targetRole}" to professional summary`,
      'Include "microservices" in technical skills',
      'Mention "cloud computing" in experience',
      'Add "API development" to skill set',
      'Include "test-driven development" practices'
    ],
    atsOptimization: [
      'Use standard section headings (Experience, Education, Skills)',
      'Avoid headers, footers, and graphics',
      'Use standard fonts (Arial, Calibri, Times New Roman)',
      'Save as both PDF and Word formats',
      'Keep formatting simple and clean'
    ],
    industrySpecific: targetRole === 'Software Engineer' ? [
      'Add GitHub profile with active repositories',
      'Include personal projects with live demos',
      'Mention contribution to open-source projects',
      'Add programming languages with proficiency levels'
    ] : [
      'Tailor skills to match job requirements',
      'Add industry-specific certifications',
      'Include relevant project management experience'
    ]
  };
};

module.exports = {
  analyzeResume,
  getAnalysisHistory,
  getAnalysisDetails,
  optimizeResume,
  downloadAnalysisReport
};
