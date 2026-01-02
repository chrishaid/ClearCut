import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Brain,
  Trophy,
  LineChart,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Smart Spaced Repetition',
    description: 'Our FSRS algorithm schedules reviews at the optimal time for maximum retention.',
  },
  {
    icon: Trophy,
    title: 'Track Your Progress',
    description: 'Watch your skills grow with detailed analytics and streak tracking.',
  },
  {
    icon: Clock,
    title: 'Timed Practice Exams',
    description: 'Simulate real test conditions with practice exams from 10 to 60 minutes.',
  },
  {
    icon: LineChart,
    title: 'Parent Dashboard',
    description: 'Parents can monitor progress, see weak areas, and celebrate wins.',
  },
]

const schools = [
  'Whitney M. Young',
  'Walter Payton',
  'Lane Tech',
  'Northside College Prep',
  'Jones College Prep',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">Clearcut</span>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            HSAT Prep for Chicago&apos;s Top Schools
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Path to{' '}
            <span className="text-blue-600">Selective Enrollment</span>{' '}
            Success
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Master the HSAT with intelligent spaced repetition. Practice smarter, not harder,
            with 1,000+ questions designed for 7th and 8th graders.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto">
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* School Names */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-gray-500 mb-4">Prepare for Chicago&apos;s top selective enrollment schools:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {schools.map((school) => (
                <span
                  key={school}
                  className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700"
                >
                  {school}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built specifically for the HSAT, covering Math and Reading comprehension
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white p-6 rounded-xl border hover:shadow-lg transition-shadow"
                >
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Study Smarter Over 30 Weeks
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our proven approach spreads learning across the school year for lasting mastery
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">Daily Practice</h3>
                <p className="text-gray-600">
                  25 questions per day, just 15-20 minutes. Build consistent habits.
                </p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Reviews</h3>
                <p className="text-gray-600">
                  FSRS algorithm brings back questions right before you forget them.
                </p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">Test Ready</h3>
                <p className="text-gray-600">
                  By test day, you&apos;ve mastered 1,000 questions and built confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Coverage */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                1,000+ HSAT-Aligned Questions
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Math */}
              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-xl">+</span>
                  </div>
                  <h3 className="text-xl font-semibold">Math (500 Questions)</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    'Pre-Algebra & Number Sense',
                    'Algebraic Concepts',
                    'Geometry & Measurement',
                    'Data Analysis & Probability',
                    'Word Problems',
                  ].map((topic) => (
                    <li key={topic} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reading */}
              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Reading (500 Questions)</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    'Main Idea & Theme',
                    'Inference & Analysis',
                    'Vocabulary in Context',
                    'Text Structure & Evidence',
                    'Author\'s Purpose & Craft',
                  ].map((topic) => (
                    <li key={topic} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your HSAT Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join students preparing for Chicago&apos;s most competitive high schools.
            No credit card required.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Clearcut</span>
            </div>
            <p className="text-sm text-gray-500">
              Built for Chicago students and families.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
