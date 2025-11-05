const axios = require('axios');

class LeecoAdapter {
  constructor() {
    this.apiKey = process.env.LEECO_API_KEY;
    this.apiUrl = process.env.LEECO_API_URL || 'https://api.leeco.ai/v1';
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async analyzeDSACode(code, language) {
    try {
      const response = await this.client.post('/code/analyze', {
        code,
        language,
        analysis_type: 'algorithm',
      });
      return response.data;
    } catch (error) {
      console.error('LeecoAI code analysis error:', error);
      throw error;
    }
  }

  async generateAlgorithmExplanation(algorithm, complexity) {
    try {
      const response = await this.client.post('/content/generate', {
        prompt: `Explain the ${algorithm} algorithm with ${complexity} time complexity in simple terms for beginners.`,
        max_tokens: 500,
      });
      return response.data;
    } catch (error) {
      console.error('LeecoAI explanation error:', error);
      throw error;
    }
  }

  async optimizeCode(code, language) {
    try {
      const response = await this.client.post('/code/optimize', {
        code,
        language,
      });
      return response.data;
    } catch (error) {
      console.error('LeecoAI optimization error:', error);
      throw error;
    }
  }

  async generateTestCases(code, language) {
    try {
      const response = await this.client.post('/code/generate-tests', {
        code,
        language,
      });
      return response.data;
    } catch (error) {
      console.error('LeecoAI test generation error:', error);
      throw error;
    }
  }
}

module.exports = new LeecoAdapter();
