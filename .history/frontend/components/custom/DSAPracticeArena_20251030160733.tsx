'use client';

import { useEffect, useState } from 'react';
import { dsaAPI } from '@/lib/api';

interface Question {
  questionId: string;
  title: string;
  difficulty: string;
  category: string;
  tags: string[];
}

export default function DSAPracticeArena() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await dsaAPI.getQuestions();
        setQuestions(response.data.questions);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleSelectQuestion = async (question: Question) => {
    try {
      const response = await dsaAPI.getQuestion(question.questionId);
      setSelectedQuestion(response.data);
      setCode(response.data.starterCode?.[language] || '');
      setResult(null);
    } catch (error) {
      console.error('Failed to fetch question:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedQuestion || !code.trim()) return;

    setSubmitting(true);
    try {
      const response = await dsaAPI.submitSolution({
        questionId: selectedQuestion.questionId,
        code,
        language,
      });
      setResult(response.data);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading problems...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Question List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold">Problems</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {questions.map((q) => (
              <button
                key={q.questionId}
                onClick={() => handleSelectQuestion(q)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                  selectedQuestion?.questionId === q.questionId ? 'bg-blue-50' : ''
                }`}
              >
                <p className="font-medium text-gray-900">{q.title}</p>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      q.difficulty === 'Easy'
                        ? 'bg-green-100 text-green-700'
                        : q.difficulty === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {q.category}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="lg:col-span-2">
        {selectedQuestion ? (
          <div className="space-y-4">
            {/* Problem Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedQuestion.title}</h2>
              <div className="prose prose-sm max-w-none mb-6">
                <p>{selectedQuestion.description}</p>
              </div>

              {/* Examples */}
              {selectedQuestion.examples && selectedQuestion.examples.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Examples:</h3>
                  {selectedQuestion.examples.map((ex: any, idx: number) => (
                    <div key={idx} className="bg-gray-100 p-3 rounded mb-2 text-sm">
                      <p>Input: {ex.input}</p>
                      <p>Output: {ex.output}</p>
                      {ex.explanation && <p>Explanation: {ex.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {selectedQuestion.constraints && selectedQuestion.constraints.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Constraints:</h3>
                  <ul className="list-disc list-inside text-sm">
                    {selectedQuestion.constraints.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Solution</h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-4 border rounded font-mono text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Write your code here..."
              />

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className={`rounded-lg shadow p-6 ${
                result.status === 'Accepted'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className="font-bold text-lg mb-4">
                  {result.status === 'Accepted' ? '✅ Accepted!' : '❌ ' + result.status}
                </h3>
                <div className="space-y-2 text-sm">
                  <p>Runtime: {result.runtime}ms</p>
                  <p>Memory: {result.memoryUsage}MB</p>
                  <p>Test Cases: {result.testCasesPassed}/{result.totalTestCases} passed</p>
                  {result.xpGained > 0 && <p className="font-semibold">+{result.xpGained} XP</p>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">Select a problem to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
