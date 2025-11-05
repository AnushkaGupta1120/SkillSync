'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import DSAPracticeArena from '@/components/custom/DSAPracticeArena';
import InterviewSimulator from '@/components/custom/InterviewSimulator';
import ResumeAnalyzer from '@/components/custom/ResumeAnalyzer';
import Leaderboard from '@/components/custom/Leaderboard';
import ProgressDashboard from '@/components/custom/ProgressDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, getCurrentUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const initUser = async () => {
      await getCurrentUser();
      setIsLoading(false);
    };

    initUser();
  }, [token, router, getCurrentUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SkillSync</h1>
            <p className="text-gray-600">Welcome, {user?.name}!</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'dsa', label: 'DSA Practice' },
              { id: 'interview', label: 'Interview' },
              { id: 'resume', label: 'Resume' },
              { id: 'leaderboard', label: 'Leaderboard' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <ProgressDashboard />}
        {activeTab === 'dsa' && <DSAPracticeArena />}
        {activeTab === 'interview' && <InterviewSimulator />}
        {activeTab === 'resume' && <ResumeAnalyzer />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </main>
    </div>
  );
}
