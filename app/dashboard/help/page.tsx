'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { 
  Search, 
  Book, 
  Video, 
  MessageCircle, 
  Mail, 
  Phone,
  ExternalLink,
  ChevronRight,
  Star,
  Clock,
  Users,
  Zap
} from 'lucide-react'

interface HelpArticle {
  id: string
  title: string
  category: string
  content: string
  readTime: number
  popularity: number
  lastUpdated: Date
}

interface VideoTutorial {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  category: string
  views: number
}

const helpArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with LeadIQ Pro',
    category: 'Getting Started',
    content: `Welcome to LeadIQ Pro! This guide will help you get up and running quickly.

## First Steps

1. **Upload Your Leads**: Start by importing your existing leads via CSV upload or manual entry
2. **Review AI Scores**: Our AI automatically scores each lead based on 50+ data points
3. **Set Up Your Pipeline**: Organize leads into stages that match your sales process
4. **Create Campaigns**: Use our email templates to start outreach campaigns

## Key Features to Explore

- **Smart Recommendations**: Get AI-powered suggestions for each lead
- **Content Library**: Access proven email templates and sales playbooks
- **Analytics Dashboard**: Track your performance with detailed metrics
- **Pipeline Management**: Visual drag-and-drop pipeline management

## Next Steps

Once you've imported your leads, focus on the highest-scoring prospects first. Use our recommended email templates and follow the suggested timing for optimal results.`,
    readTime: 5,
    popularity: 95,
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: 'ai-scoring-explained',
    title: 'Understanding AI Lead Scoring',
    category: 'AI Features',
    content: `Our AI lead scoring system analyzes multiple data points to predict conversion probability.

## How It Works

The AI scoring algorithm considers:

### Industry Factors (25% weight)
- Industry growth trends
- Market maturity
- Typical buying patterns
- Competition levels

### Role & Authority (20% weight)
- Decision-making power
- Budget authority
- Influence level
- Seniority

### Source Quality (15% weight)
- Lead source reliability
- Historical conversion rates
- Source engagement levels

### Engagement Signals (20% weight)
- Email opens and clicks
- Website behavior
- Content downloads
- Response rates

### Company Factors (10% weight)
- Company size
- Growth stage
- Technology stack
- Recent funding

### Timing & Context (10% weight)
- Seasonality factors
- Recent company news
- Market conditions
- Competitive landscape

## Score Interpretation

- **80-100 (Hot)**: High conversion probability, contact immediately
- **60-79 (Warm)**: Good potential, nurture with targeted content
- **0-59 (Cold)**: Lower priority, focus on education and awareness

## Improving Scores

You can improve lead scores by:
- Adding more engagement data
- Updating company information
- Tracking interaction history
- Providing feedback on conversions`,
    readTime: 8,
    popularity: 87,
    lastUpdated: new Date('2024-01-12')
  },
  {
    id: 'email-templates-guide',
    title: 'Using Email Templates Effectively',
    category: 'Content & Templates',
    content: `Our email templates are designed based on industry best practices and proven conversion data.

## Template Categories

### Cold Outreach
- Focus on specific pain points
- Include social proof
- Clear value proposition
- Soft call-to-action

### Follow-Up
- Reference previous interaction
- Provide additional value
- Address potential objections
- Create urgency

### Nurture
- Educational content
- Industry insights
- Case studies
- Thought leadership

### Proposal
- Detailed solution overview
- ROI calculations
- Implementation timeline
- Next steps

### Closing
- Address final objections
- Create urgency
- Social proof
- Clear next steps

## Personalization Best Practices

1. **Use Dynamic Variables**: Leverage {{first_name}}, {{company_name}}, etc.
2. **Industry-Specific Content**: Reference industry challenges and trends
3. **Company Research**: Mention recent news, funding, or achievements
4. **Mutual Connections**: Reference shared contacts or experiences
5. **Relevant Case Studies**: Use examples from similar companies

## A/B Testing

Test different:
- Subject lines
- Opening lines
- Value propositions
- Call-to-action buttons
- Send times

## Tracking Performance

Monitor:
- Open rates
- Click-through rates
- Response rates
- Meeting bookings
- Conversion rates`,
    readTime: 6,
    popularity: 82,
    lastUpdated: new Date('2024-01-10')
  }
]

const videoTutorials: VideoTutorial[] = [
  {
    id: 'platform-overview',
    title: 'LeadIQ Pro Platform Overview',
    description: 'Complete walkthrough of all platform features and capabilities',
    duration: '12:34',
    thumbnail: '/api/placeholder/320/180',
    category: 'Getting Started',
    views: 1247
  },
  {
    id: 'ai-scoring-deep-dive',
    title: 'AI Lead Scoring Deep Dive',
    description: 'Understanding how our AI scores leads and how to interpret the results',
    duration: '8:45',
    thumbnail: '/api/placeholder/320/180',
    category: 'AI Features',
    views: 892
  },
  {
    id: 'pipeline-management',
    title: 'Pipeline Management Best Practices',
    description: 'How to set up and manage your sales pipeline for maximum efficiency',
    duration: '15:22',
    thumbnail: '/api/placeholder/320/180',
    category: 'Sales Process',
    views: 634
  },
  {
    id: 'campaign-creation',
    title: 'Creating Effective Email Campaigns',
    description: 'Step-by-step guide to creating and launching successful email campaigns',
    duration: '10:18',
    thumbnail: '/api/placeholder/320/180',
    category: 'Campaigns',
    views: 756
  }
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'contact'>('articles')

  const categories = ['Getting Started', 'AI Features', 'Content & Templates', 'Sales Process', 'Campaigns', 'Analytics']

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredVideos = videoTutorials.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
            <p className="mt-1 text-sm text-gray-500">
              Find answers, watch tutorials, and get support for LeadIQ Pro
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search help articles and tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-lg"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <Zap className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Quick Start Guide</h3>
              <p className="text-blue-100 mb-4">Get up and running in 5 minutes</p>
              <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-50">
                Start Now
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <Video className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
              <p className="text-green-100 mb-4">Watch step-by-step guides</p>
              <button 
                onClick={() => setActiveTab('videos')}
                className="bg-white text-green-600 px-4 py-2 rounded font-medium hover:bg-green-50"
              >
                Watch Now
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <MessageCircle className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
              <p className="text-purple-100 mb-4">Get help from our team</p>
              <button 
                onClick={() => setActiveTab('contact')}
                className="bg-white text-purple-600 px-4 py-2 rounded font-medium hover:bg-purple-50"
              >
                Contact Us
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'articles', name: 'Help Articles', icon: Book },
                { id: 'videos', name: 'Video Tutorials', icon: Video },
                { id: 'contact', name: 'Contact Support', icon: MessageCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Category Filter */}
          {(activeTab === 'articles' || activeTab === 'videos') && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {activeTab === 'articles' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredArticles.map((article) => (
                <div key={article.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {article.category}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Star className="h-3 w-3 mr-1 text-yellow-500" />
                      {article.popularity}%
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.content.substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {article.readTime} min read
                    </div>
                    <button className="text-primary hover:text-blue-700 font-medium text-sm flex items-center">
                      Read More
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <div key={video.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="aspect-video bg-gray-200 flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {video.duration}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {video.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {video.views.toLocaleString()} views
                      </div>
                      <button className="text-primary hover:text-blue-700 font-medium text-sm">
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Options */}
                <div className="space-y-6">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <MessageCircle className="h-6 w-6 text-blue-500 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Get instant help from our support team. Available 24/7.
                    </p>
                    <button className="btn-primary w-full">
                      Start Chat
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Mail className="h-6 w-6 text-green-500 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Send us a detailed message and we'll respond within 4 hours.
                    </p>
                    <button className="btn-secondary w-full">
                      Send Email
                    </button>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Phone className="h-6 w-6 text-purple-500 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">Phone Support</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Speak directly with our technical support team.
                    </p>
                    <div className="text-lg font-semibold text-gray-900 mb-2">
                      1-800-LEADIQ (532-3479)
                    </div>
                    <div className="text-sm text-gray-500">
                      Mon-Fri: 9 AM - 6 PM EST
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Send us a message</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                        <option>General Question</option>
                        <option>Technical Issue</option>
                        <option>Feature Request</option>
                        <option>Billing Question</option>
                        <option>Account Issue</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="Describe your question or issue in detail..."
                      />
                    </div>
                    
                    <button type="submit" className="btn-primary w-full">
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}