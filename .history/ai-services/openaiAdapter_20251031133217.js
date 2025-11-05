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
      return response.data.choices.message.content;
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

Format as JSON.
    `;

    try {
      const text = await this.generateText(prompt, 1000);
      return JSON.parse(text);
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
