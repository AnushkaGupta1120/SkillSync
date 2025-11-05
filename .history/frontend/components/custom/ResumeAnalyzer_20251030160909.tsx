'use client';

import { useState } from 'react';
import { resumeAPI } from '@/lib/api';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await resumeAPI.analyzeResume(formData);
      setResult(response.data);
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Resume Analysis Results</h2>

          {/* ATS Score */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold">ATS Score</span>
              <span className="text-3xl font-bold text-blue-600">
                {result.analysis?.atsScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${result.analysis?.atsScore}%` }}
              ></div>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold text-lg">
              Overall Rating: {result.analysis?.overallRating}
            </p>
          </div>

          {/* Sections */}
          {result.analysis?.sections && (
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-4">Section Analysis</h3>
              <div className="space-y-3">
                {Object.entries(result.analysis.sections).map(([section, data]: any) => (
                  <div key={section} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{section.replace('_', ' ')}</span>
                      <span className="text-sm font-semibold">{data.score}%</span>
                    </div>
                    <p className="text-sm text-gray-600">{data.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {result.analysis?.keywords && (
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-4">Keywords Found</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.analysis.keywords.found?.map((keyword: string) => (
                  <span
                    key={keyword}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <h3 className="font-bold text-lg mb-4">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.analysis.keywords.missing?.map((keyword: string) => (
                  <span
                    key={keyword}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.analysis?.suggestions && (
            <div>
              <h3 className="font-bold text-lg mb-4">Suggestions for Improvement</h3>
              <ul className="space-y-2">
                {result.analysis.suggestions.map((suggestion: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 font-bold mr-3">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => setResult(null)}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
          >
            Upload Another Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Resume Analyzer</h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-6">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-600 mb-4">
            Upload your resume to get instant feedback
          </p>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="resume-upload"
          />

          <label
            htmlFor="resume-upload"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition"
          >
            Choose File
          </label>

          {file && <p className="mt-4 text-sm text-gray-700">{file.name}</p>}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50"
        >
          {uploading ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>
    </div>
  );
}
