'use client';

import { useState } from 'react';
import { interviewAPI } from '@/lib/api';

export default function InterviewSimulator() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [sessionType, setSessionType] = useState('technical');
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const response = await interviewAPI.startInterview(sessionType);
      setSessionId(response.data.sessionId);
      setQuestions(response.data.questions);
      setIsActive(true);
      setCurrentQuestionIndex(0);
      setAnswers({});
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleNext = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers[currentQuestionIndex] || '';

    if (sessionId && answer.trim()) {
      try {
        await interviewAPI.submitAnswer(sessionId, {
          questionId: currentQuestion.id,
          answer,
        });
      } catch (error) {
        console.error('Failed to submit answer:', error);
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleComplete = async () => {
    if (sessionId) {
      try {
        const response = await interviewAPI.completeInterview(sessionId);
        setResult(response.data);
        setIsActive(false);
      } catch (error) {
        console.error('Failed to complete interview:', error);
      }
    }
  };

  if (result) {
    return (
      <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Interview Results</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Score:</span>
            <span className="text-3xl font-bold text-blue-600">{result.score}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Duration:</span>
            <span>{Math.floor(result.duration / 60)}m {result.duration % 60}s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Questions:</span>
            <span>{result.questionsAttempted}/{result.totalQuestions}</span>
          </div>

          {result.feedback && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold mb-4">Feedback</h3>
              <p className="mb-4">{result.feedback.summary}</p>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Strengths:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.feedback.strengths?.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Areas to Improve:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.feedback.improvements?.map((imp: string, i: number) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="bg-white rounded-lg shadow p-12 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">Interview Simulator</h2>
        <p className="text-gray-600 mb-6">
          Choose an interview type to practice and improve your skills.
        </p>

        <select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-6 focus:ring-2 focus:ring-blue-500"
        >
          <option value="technical">Technical Interview</option>
          <option value="behavioral">Behavioral Interview</option>
          <option value="system_design">System Design Interview</option>
        </select>

        <button
          onClick={handleStartInterview}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Starting...' : 'Start Interview'}
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="text-center py-8">Loading interview questions...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Progress */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">Progress</h3>
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-sm ${
                  idx === currentQuestionIndex
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : idx < currentQuestionIndex
                    ? 'bg-green-100 text-green-900'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Q{idx + 1}: {answers[idx] ? '✓ Answered' : 'Pending'}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <h2 className="text-2xl font-bold">{currentQuestion.question}</h2>
          </div>

          <textarea
            value={answers[currentQuestionIndex] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-64 p-4 border rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 mb-6"
          />

          <div className="flex gap-4">
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestionIndex]}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
            >
              Next Question
            </button>

            {isLastQuestion && (
              <button
                onClick={handleComplete}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
              >
                Complete Interview
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
