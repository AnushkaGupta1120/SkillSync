'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Candidate {
  id: string
  name: string
  email: string
  skills: string[]
  experience: string
  atsScore: number
  interviewScore?: number
  status: 'new' | 'reviewed' | 'interviewed' | 'shortlisted' | 'rejected'
}

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data
  useEffect(() => {
    setCandidates([
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        skills: ['React', 'Node.js', 'TypeScript'],
        experience: 'Mid-level',
        atsScore: 85,
        interviewScore: 78,
        status: 'interviewed'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        skills: ['Python', 'Django', 'PostgreSQL'],
        experience: 'Senior',
        atsScore: 92,
        status: 'reviewed'
      }
    ])
  }, [])

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Recruiter Dashboard</h1>
        <p className="text-muted-foreground">
          Manage candidates, schedule interviews, and analyze performance
        </p>
      </div>

      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="jobs">Job Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Management</CardTitle>
              <CardDescription>
                Search, filter, and manage candidate applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="interviewed">Interviewed</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredCandidates.map((candidate) => (
                  <Card key={candidate.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{candidate.name}</CardTitle>
                          <CardDescription>{candidate.email}</CardDescription>
                        </div>
                        <Badge variant={
                          candidate.status === 'shortlisted' ? 'default' :
                          candidate.status === 'interviewed' ? 'secondary' :
                          candidate.status === 'reviewed' ? 'outline' : 'destructive'
                        }>
                          {candidate.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium">Experience</p>
                          <p className="text-sm text-muted-foreground">{candidate.experience}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">ATS Score</p>
                          <p className="text-sm text-muted-foreground">{candidate.atsScore}%</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Interview Score</p>
                          <p className="text-sm text-muted-foreground">
                            {candidate.interviewScore ? `${candidate.interviewScore}%` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Skills</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {candidate.skills.slice(0, 2).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{candidate.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        <Button size="sm">
                          Schedule Interview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <Card>
            <CardHeader>
              <CardTitle>Interview Management</CardTitle>
              <CardDescription>
                Schedule and manage candidate interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Interview management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                View candidate performance insights and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Job Management</CardTitle>
              <CardDescription>
                Create and manage job postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Job management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
