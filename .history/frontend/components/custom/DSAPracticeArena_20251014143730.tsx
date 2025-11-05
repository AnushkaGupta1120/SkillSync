'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Save, 
  RefreshCw, 
  Lightbulb, 
  Clock, 
  Memory, 
  Trophy,
  Eye,
  MessageSquare
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { difficultyColors } from '@/lib/utils'

// Dynamic import of Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export function DSAPracticeArena() {
  const [selectedProblem, setSelectedProblem] = useState<any>(null)
  const [code, setCode] = useState(`// Write your solution here
function solution(nums, target) {
    // Your code here
    return [];
}`)
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [showHint, setShowHint] = useState(false)

  const problems = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      category: "Array",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
      ],
      constraints: [
        "2 ≤ nums.length ≤ 10⁴",
        "-10⁹ ≤ nums[i] ≤ 10⁹",
        "-10⁹ ≤ target ≤ 10⁹"
      ],
      tags: ["Array", "Hash Table"],
      acceptance: 49.2,
      submissions: 15420,
      hint: "Use a hash map to store numbers you've seen and their indices. For each number, check if target - number exists in the map."
    },
    {
      id: 2,
      title: "Longest Palindromic Substring",
      difficulty: "Medium",
      category: "String",
      description: "Given a string s, return the longest palindromic substring in s.",
      examples: [
        { input: 's = "babad"', output: '"bab" or "aba"' },
        { input: 's = "cbbd"', output: '"bb"' }
      ],
      constraints: [
        "1 ≤ s.length ≤ 1000",
        "s consist of only digits and English letters"
      ],
      tags: ["String", "Dynamic Programming"],
      acceptance: 32.1,
      submissions: 8965,
      hint: "Try expanding around centers. For each character (and each pair of characters), expand outwards to find the longest palindrome."
    }
  ]

  const runCode = async () => {
    setIsRunning(true)
    
    // Simulate code execution
    setTimeout(() => {
      const mockResults = {
        output: "Output: [0, 1]\nExecution time: 72ms\nMemory usage: 44.2MB",
        passed: 8,
        total: 10,
        runtime: "72ms",
        memory: "44.2MB",
        status: "Accepted"
      }
      
      setTestResults(mockResults)
      setOutput(mockResults.output)
      setIsRunning(false)
    }, 2000)
  }

  const getHint = async () => {
    setShowHint(true)
    // In real implementation, this would call the AI service
  }

  const submitCode = async () => {
    // Submit code for final evaluation
    await runCode()
  }

  useEffect(() => {
    if (problems.length > 0) {
      setSelectedProblem(problems[0])
    }
  }, [])

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
      {/* Problem List & Details */}
      <div className="flex flex-col space-y-4">
        {/* Problem Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              DSA Problems
              <Button size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedProblem?.id === problem.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedProblem(problem)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{problem.title}</h3>
                    <Badge className={difficultyColors[problem.difficulty]}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{problem.category}</span>
                    <span>{problem.acceptance}% acceptance</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Problem Details */}
        {selectedProblem && (
          <Card className="flex-1 overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedProblem.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={difficultyColors[selectedProblem.difficulty]}>
                    {selectedProblem.difficulty}
                  </Badge>
                  <Badge variant="outline">{selectedProblem.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedProblem.description}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Examples</h4>
                <div className="space-y-3">
                  {selectedProblem.examples.map((example: any, index: number) => (
                    <div key={index} className="bg-muted/30 p-3 rounded-lg text-sm font-mono">
                      <div><strong>Input:</strong> {example.input}</div>
                      <div><strong>Output:</strong> {example.output}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Constraints</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedProblem.constraints.map((constraint: string, index: number) => (
                    <li key={index}>• {constraint}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProblem.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {showHint && (
                <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Hint</h4>
                      <p className="text-sm text-yellow-700">{selectedProblem.hint}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Code Editor & Results */}
      <div className="flex flex-col space-y-4">
        {/* Editor Controls */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button size="sm" variant="outline" onClick={getHint}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Hint
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={runCode} disabled={isRunning}>
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run'}
                </Button>
                <Button size="sm" onClick={submitCode} disabled={isRunning}>
                  <Save className="w-4 h-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monaco Editor */}
        <Card className="flex-1">
          <CardContent className="p-0 h-full">
            <div className="h-[300px] rounded-lg overflow-hidden">
              <MonacoEditor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              Results
              {testResults && (
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{testResults.runtime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Memory className="w-4 h-4" />
                    <span>{testResults.memory}</span>
                  </div>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {output ? (
              <div className="space-y-4">
                <pre className="bg-muted/30 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap">
                  {output}
                </pre>
                
                {testResults && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        {testResults.passed}/{testResults.total} test cases passed
                      </span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {testResults.status}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Run your code to see the results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}