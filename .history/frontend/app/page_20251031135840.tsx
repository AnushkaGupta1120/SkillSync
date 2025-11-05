'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (token && user) {
      router.push('/dashboard');
    }
  }, [token, user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SkillSync
            </div>
            <span className="text-sm text-gray-600">AI-Powered Learning</span>
          </div>
          <div className="flex space-x-4">
            {token ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Master{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DSA
                </span>{' '}
                &{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ace Interviews
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                AI-powered platform for freshers to practice Data Structures & Algorithms, prepare
                for interviews, and land your dream job with confidence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={token ? '/dashboard' : '/auth/register'}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition transform hover:scale-105"
              >
                🚀 Start Learning Now
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">DSA Questions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">10k+</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right - Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
              <div className="text-6xl">🚀</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to ace your coding interviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">DSA Practice Arena</h3>
              <p className="text-gray-600">
                Solve 500+ DSA problems with AI-powered hints, explanations, and real-time
                feedback.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">🎤</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Interview Simulator</h3>
              <p className="text-gray-600">
                Practice with AI mock interviews that evaluate your technical and behavioral
                skills.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Resume Analyzer</h3>
              <p className="text-gray-600">
                Get ATS-optimized resume feedback with AI suggestions for improvement.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Performance Analytics</h3>
              <p className="text-gray-600">
                Track your progress with detailed insights and improvement recommendations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Leaderboard</h3>
              <p className="text-gray-600">
                Compete with peers, track streaks, and earn XP badges for consistency.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Mentorship</h3>
              <p className="text-gray-600">
                Get instant guidance, code reviews, and personalized learning paths.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Level Up?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students preparing for top tech companies
          </p>
          <Link
            href={token ? '/dashboard' : '/auth/register'}
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:shadow-xl transition transform hover:scale-105"
          >
            Start Free Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2025 SkillSync. All rights reserved. | AI-Powered Learning Platform</p>
        </div>
      </footer>
    </div>
  );
}
