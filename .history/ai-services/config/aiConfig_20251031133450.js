module.exports = {
  providers: {
    openai: {
      enabled: !!process.env.OPENAI_API_KEY,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
    },
    leeco: {
      enabled: !!process.env.LEECO_API_KEY,
      apiUrl: process.env.LEECO_API_URL,
    },
    gemini: {
      enabled: !!process.env.GEMINI_API_KEY,
      model: 'gemini-pro',
    },
  },
  dsa: {
    maxHintLength: 200,
    codeAnalysisTimeout: 5000,
  },
  interview: {
    maxAnswerLength: 2000,
    evaluationTimeout: 10000,
  },
  resume: {
    maxFileSize: 5 * 1024 * 1024,
    supportedFormats: ['pdf', 'doc', 'docx', 'txt'],
  },
};
