'use client';

import { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [data, setData] = useState([
    {
      rank: 1,
      name: 'Akshat Pandagre',
      xp: 1250,
      problemsSolved: 45,
      streak: 7,
      level: 13,
    },
    {
      rank: 2,
      name: 'Student 2',
      xp: 1100,
      problemsSolved: 40,
      streak: 5,
      level: 12,
    },
    {
      rank: 3,
      name: 'Student 3',
      xp: 950,
      problemsSolved: 35,
      streak: 3,
      level: 10,
    },
  ]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Level
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                XP
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Problems
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Streak
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((user) => (
              <tr key={user.rank} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                    {user.rank}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    Level {user.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700">{user.xp.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-700">{user.problemsSolved}</td>
                <td className="px-6 py-4">
                  <span className="text-lg">🔥 {user.streak}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
