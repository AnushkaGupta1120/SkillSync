'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Target, 
  Code, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Zap
} from 'lucide-react'
import { DSAPracticeArena } from '@/components/custom/DSAPracticeArena'
import { InterviewSimulator } from '@/components/custom/InterviewSimulator'
import { ResumeAnalyzer } from '@/components/custom/ResumeAnalyzer'
import { ProgressDashboard } from '@/components/custom/ProgressDashboard'

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    problemsSolved: 45,
    currentStreak: 7,
    totalXP: 2840,
    ranking: 156,
    weeklyGoal: 75, // percentage
    skillLevel: 'Intermediate'
  })

  const recentActivities = [
    { type: 'problem', title: 'Two Sum', difficulty: 'Easy', completed: true },
    { type: 'interview', title: 'Mock Interview #12', score: 85, completed: true },
    { type: 'resume', title: 'Resume Analysis', score: 78, completed: true },
  ]

  const achievements = [
    { name: '7-Day Streak', icon: '🔥', earned: true },
    { name: 'Problem Solver', icon: '🧩', earned: true },
    { name: 'Interview Master', icon: '🎯', earned: false },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-muted-foreground">
          You're on a {stats.currentStreak}-day streak! Keep it up to reach your goals.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.problemsSolved}</div>
            <p className="text-xs text-muted-foreground">
              +12 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Personal best: 14 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalXP.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Level up at 3000 XP
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Global Rank</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{stats.ranking}</div>
            <p className="text-xs text-muted-foreground">
              +23 positions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="practice" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="practice" className="flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>Practice</span>
          </TabsTrigger>
          <TabsTrigger value="interviews" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Interviews</span>
          </TabsTrigger>
          <TabsTrigger value="resume" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Resume</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Progress</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="practice">
          <DSAPracticeArena />
        </TabsContent>

        <TabsContent value="interviews">
          <InterviewSimulator />
        </TabsContent>

        <TabsContent value="resume">
          <ResumeAnalyzer />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressDashboard />
        </TabsContent>
      </Tabs>

      {/* Weekly Goal & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest practice sessions and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'problem' && <Code className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'interview' && <MessageSquare className="w-5 h-5 text-green-600" />}
                    {activity.type === 'resume' && <FileText className="w-5 h-5 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.type === 'problem' && (
                        <Badge className={`${activity.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {activity.difficulty}
                        </Badge>
                      )}
                      {(activity.type === 'interview' || activity.type === 'resume') && (
                        <span>Score: {activity.score}/100</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Goal</CardTitle>
              <CardDescription>Solve 10 problems this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={stats.weeklyGoal} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>7/10 problems</span>
                  <span>{stats.weeklyGoal}%</span>
                </div>
                <Button size="sm" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your coding milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-2 rounded ${achievement.earned ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <span className="text-2xl">{achievement.icon}</span>
                    <span className={`font-medium ${achievement.earned ? 'text-green-800' : 'text-gray-500'}`}>
                      {achievement.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}