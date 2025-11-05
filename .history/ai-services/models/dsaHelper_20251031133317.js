const openAiAdapter = require('../openAiAdapter');
const leecoAdapter = require('../leecoAdapter');

class DSAHelper {
  async analyzeCode(code, language, questionId) {
    try {
      // Get optimization suggestions
      const optimizationResult = await leecoAdapter.optimizeCode(code, language);
      
      // Get explanation
      const explanation = await openAiAdapter.generateCodeExplanation(code, language);

      return {
        status: 'success',
        analysis: {
          codeQuality: optimizationResult.quality_score || 75,
          timeComplexity: optimizationResult.time_complexity || 'O(n)',
          spaceComplexity: optimizationResult.space_complexity || 'O(1)',
          issues: optimizationResult.issues || [],
          explanation,
          suggestions: optimizationResult.suggestions || [],
        },
      };
    } catch (error) {
      console.error('Code analysis error:', error);
      return {
        status: 'error',
        message: 'Code analysis failed',
        fallback: {
          codeQuality: 75,
          timeComplexity: 'Unknown',
          spaceComplexity: 'Unknown',
          issues: [],
        },
      };
    }
  }

  async generateHint(questionId, difficulty = 'medium') {
    try {
      const hintPrompts = {
        easy: `Give a simple hint for an easy level DSA problem (${questionId}). The hint should guide without giving away the answer.`,
        medium: `Give a hint for a medium level DSA problem (${questionId}). Suggest an algorithm approach.`,
        hard: `Give a hint for a hard level DSA problem (${questionId}). Suggest optimization techniques.`,
      };

      const prompt = hintPrompts[difficulty] || hintPrompts.medium;
      const hint = await openAiAdapter.generateText(prompt, 200);

      return hint;
    } catch (error) {
      console.error('Hint generation error:', error);
      return 'Try breaking down the problem into smaller subproblems.';
    }
  }

  async explainSolution(code, language, approach) {
    try {
      const prompt = `
Explain this ${language} solution approach: ${approach}

Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. Algorithm overview
2. Key insights
3. Time/Space complexity
4. When to use this approach
      `;

      return await openAiAdapter.generateText(prompt, 1000);
    } catch (error) {
      console.error('Solution explanation error:', error);
      throw error;
    }
  }
}

module.exports = new DSAHelper();
