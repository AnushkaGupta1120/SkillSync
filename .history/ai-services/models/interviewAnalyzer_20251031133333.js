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
        const eval = await this.analyzeAnswer(answers[i], questions[i], sessionType);
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
