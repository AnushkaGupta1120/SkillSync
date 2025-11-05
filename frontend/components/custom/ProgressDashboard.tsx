'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth';

export default function ProgressDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const stats = [
    {
      label: 'Problems Solved',
      value: user?.stats?.problemsSolved || 0,
      icon: '🎯',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total XP',
      value: user?.stats?.totalXp || 0,
      icon: '⭐',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'Current Streak',
      value: user?.stats?.currentStreak || 0,
      icon: '🔥',
      color: 'bg-red-100 text-red-600',
    },
    {
      label: 'Level',
      value: Math.floor((user?.stats?.totalXp || 0) / 100) + 1,
      icon: '🏆',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className={`inline-block text-3xl mb-2 ${stat.color} p-3 rounded-lg`}>
              {stat.icon}
            </div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <p className="text-lg text-gray-900">{user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <p className="text-lg text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <p className="text-lg text-gray-900 capitalize">{user?.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <p className="text-lg text-gray-900 capitalize">
              {user?.profile?.experienceLevel || 'Beginner'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          No recent activity yet. Start solving problems!
        </div>
      </div>
    </div>
  );
}
