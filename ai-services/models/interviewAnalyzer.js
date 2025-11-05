const openAiAdapter = require('../openAiAdapter');

class InterviewAnalyzer {
  async analyzeAnswer(answer, question, sessionType = 'technical') {
    try {
      const analysis = await openAiAdapter.analyzeInterviewAnswer(answer, question, sessionType);

      return {
        status: 'success',
        analysis: {
          score: analysis.score || 70,
          clarity: analysis.clarity || 7,
          correctness: analysis.correctness || 8,
          depth: analysis.depth || 6,
          communication: analysis.communication || 7,
          feedback: analysis.feedback || 'Good attempt!',
          strengths: analysis.strengths || [],
          improvements: analysis.improvements || [],
        },
      };
    } catch (error) {
      console.error('Answer analysis error:', error);
      return {
        status: 'error',
        fallback: {
          score: 70,
          clarity: 7,
          correctness: 7,
          depth: 7,
          communication: 7,
        },
      };
    }
  }

  async generateFollowUp(answer, question, sessionType) {
    try {
      const prompt = `
Based on this ${sessionType} interview answer, generate a follow-up question:

Question: ${question}
Answer: ${answer}

The follow-up should:
1. Go deeper into the topic
2. Test related knowledge
3. Be appropriate for the session type
      `;

      const followUp = await openAiAdapter.generateText(prompt, 200);
      return followUp;
    } catch (error) {
      console.error('Follow-up generation error:', error);
      return 'Can you elaborate on that? How would you handle edge cases?';
    }
  }

  async evaluateSession(answers, questions, sessionType) {
    try {
      let totalScore = 0;
      const evaluations = [];

      for (let i = 0; i < answers.length; i++) {
const axios = require('axios');

class OpenAIAdapter {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.apiUrl = 'https://api.openai.com/v1';
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async generateText(prompt, maxTokens = 500) {
    try {
      const response = await this.client.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7,
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw error;
    }
  }

  async analyzeInterviewAnswer(answer, question, sessionType) {
    const prompt = `
You are an expert interview coach. Analyze the following interview answer:

Question: ${question}
Answer: ${answer}
Interview Type: ${sessionType}

Provide feedback on:
1. Clarity and Structure
2. Correctness
3. Depth of Knowledge
4. Communication Skills
5. Score (0-100)

Format your answer as a valid one-line minified JSON object with only double quotes.
Return only the JSON object.
    `;

    try {
      const text = await this.generateText(prompt, 1000);
      return JSON.parse(text); // Use only JSON.parse!
    } catch (error) {
      console.error('Interview analysis error:', error);
      return {
        clarity: 7,
        correctness: 8,
        depth: 6,
        communication: 7,
        score: 70,
      };
    }
  }

  async improveResumeSection(section, content) {
    const prompt = `
You are a professional resume writer. Improve this ${section} section of a resume:

Current Content: ${content}

Provide an improved version that:
1. Is action-oriented (uses strong verbs)
2. Includes quantifiable metrics
3. Is concise and impactful
4. Matches ATS standards

Return only the improved text.
    `;

    try {
      return await this.generateText(prompt, 500);
    } catch (error) {
      console.error('Resume improvement error:', error);
      throw error;
    }
  }

  async generateCodeExplanation(code, language) {
    const prompt = `
Explain this ${language} code in simple terms for a beginner programmer:

\`\`\`${language}
${code}
\`\`\`

Include:
1. What the code does
2. Step-by-step explanation
3. Time and Space complexity
4. Potential improvements
    `;

    try {
      return await this.generateText(prompt, 1000);
    } catch (error) {
      console.error('Code explanation error:', error);
      throw error;
    }
  }
}

module.exports = new OpenAIAdapter();
        evaluations.push(eval);
        totalScore += eval.analysis?.score || 70;
      }

      const averageScore = Math.round(totalScore / answers.length);

      return {
        status: 'success',
        overallScore: averageScore,
        totalQuestions: questions.length,
        answeredQuestions: answers.length,
        evaluations,
        recommendation: this.getRecommendation(averageScore),
      };
    } catch (error) {
      console.error('Session evaluation error:', error);
      throw error;
    }
  }

  getRecommendation(score) {
    if (score >= 90) return 'Excellent! You are interview ready.';
    if (score >= 75) return 'Good! Keep practicing for challenging scenarios.';
    if (score >= 60) return 'Fair. Focus on clarity and depth of answers.';
    return 'Keep practicing! Review fundamentals and prepare more.';
  }
}

module.exports = new InterviewAnalyzer();
