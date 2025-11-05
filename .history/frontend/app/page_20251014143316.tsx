import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Users, 
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Code,
      title: "DSA Practice Arena",
      description: "Real-time code editor with AI-powered hints and explanations",
      badge: "AI-Powered"
    },
    {
      icon: MessageSquare,
      title: "Mock Interviews",
      description: "AI and human interviews with detailed feedback reports",
      badge: "Interactive"
    },
    {
      icon: FileText,
      title: "Resume Analyzer",
      description: "ATS optimization with grammar and content suggestions",
      badge: "Smart Analysis"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track progress with detailed insights and improvement goals",
      badge: "Data-Driven"
    }
  ]

  const benefits = [
    "AI-generated questions based on weak areas",
    "Real-time leaderboards and progress tracking",
    "Industry-standard coding environment",
    "Comprehensive interview simulation",
    "ATS-optimized resume scoring",
    "Personalized learning paths"
  ]

  return (
    <main className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge className="mb-4" variant="secondary">
          <Sparkles className="w-4 h-4 mr-1" />
          Powered by AI
        </Badge>
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          SkillSync AI
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Next-generation platform for freshers and recruiters using AI-backed DSA practice, 
          interview simulation, and performance analytics
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register?role=student">
            <Button size="lg" className="group">
              Start Learning
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/auth/register?role=recruiter">
            <Button size="lg" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              For Recruiters
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <feature.icon className="w-8 h-8 text-blue-600" />
                <Badge variant="secondary" className="text-xs">
                  {feature.badge}
                </Badge>
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card className="mb-16 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-4">Why Choose SkillSync AI?</CardTitle>
          <CardDescription className="text-lg">
            Comprehensive platform designed for modern tech career development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Your Tech Career?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Join thousands of students and recruiters who are already using SkillSync AI 
          to achieve their goals faster and more efficiently.
        </p>
        <Link href="/auth/register">
          <Button size="lg" className="px-8">
            Get Started Free
          </Button>
        </Link>
      </div>
    </main>
  )
}