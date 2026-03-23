# Lead Intelligence Platform

A comprehensive B2B lead intelligence platform with AI-powered lead scoring, smart recommendations, and advanced CRM capabilities. Built with Next.js, Supabase, and modern AI technologies.

## 🚀 Features

### Core Features
- **🏠 Landing Page** - Professional product site with hero section, features, and contact forms
- **🔐 Authentication System** - Role-based access (Admin, Sales Manager, Sales Executive) with Supabase Auth
- **📥 Lead Data Upload** - CSV upload, manual entry, Google Sheets, and CRM integration
- **🤖 AI Lead Scoring** - Advanced ML algorithm analyzing 50+ data points with 85%+ accuracy
- **📊 CRM Dashboard** - Real-time analytics with interactive charts and performance metrics
- **🎯 Smart Recommendations** - AI-powered suggestions for contact timing, channels, and messaging
- **🧠 Lead Profile Pages** - Detailed lead information with activity timeline and recommendations
- **📈 Visual Sales Pipeline** - Drag-and-drop pipeline management with conversion tracking
- **🔎 Advanced Lead Segmentation** - Multi-criteria filtering and smart lead categorization
- **🔁 Marketing Automation** - Email campaigns, auto-tagging, and follow-up sequences
- **📧 Content Library** - Proven email templates, sales playbooks, and market insights
- **📊 Advanced Analytics** - Deep performance insights with predictive analytics
- **🔔 Real-time Notifications** - Smart alerts and recommendation system
- **🎓 Onboarding & Help** - Interactive tours and comprehensive help center

### AI-Powered Intelligence
- **Advanced Lead Scoring** - ML algorithm considering industry, role, source, engagement, and timing
- **Conversion Probability** - Predicts likelihood of conversion with confidence scores
- **Smart Categorization** - Automatically categorizes leads as Hot (80+), Warm (60-79), or Cold (<60)
- **Personalized Recommendations** - Context-aware suggestions for optimal outreach
- **Predictive Analytics** - Forecasts pipeline performance and revenue projections
- **Behavioral Analysis** - Tracks engagement patterns and interaction history

### Enhanced Features
- **Supabase Integration** - Real-time database with Row Level Security
- **Email Campaign Management** - Multi-touch sequences with performance tracking
- **Sales Playbooks** - Industry-specific methodologies and best practices
- **Market Insights** - Curated industry trends and competitive intelligence
- **Video Tutorials** - Comprehensive learning resources
- **Multi-channel Outreach** - Email, LinkedIn, phone integration
- **Team Collaboration** - Lead assignment and activity sharing
- **Export & Reporting** - PDF/CSV exports with custom reports

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Zustand** - State management

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Row Level Security** - Fine-grained access control
- **Supabase Auth** - Authentication and authorization
- **Edge Functions** - Serverless API endpoints

### AI & Analytics
- **Custom ML Algorithm** - Lead scoring and prediction
- **Real-time Analytics** - Performance tracking
- **Behavioral Analysis** - User interaction patterns

### Integrations
- **Email Services** - SMTP integration for campaigns
- **CSV Processing** - PapaParse for data import
- **File Handling** - Drag-and-drop uploads
- **Notification System** - Real-time alerts

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- SMTP email service (optional)

### 1. Clone and Install
```bash
git clone <repository-url>
cd lead-intelligence-platform
npm install
```

### 2. Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
3. Enable Row Level Security on all tables
4. Get your project URL and anon key from Settings > API

### 3. Environment Configuration
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key
```

### 4. Database Setup
The schema includes:
- **Users table** - User profiles and roles
- **Leads table** - Lead data with AI scores
- **Activities table** - Lead interaction history
- **Recommendations table** - AI-generated suggestions
- **Email templates** - Reusable email content
- **Campaigns table** - Marketing campaign data

### 5. Run the Application
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Accounts

Pre-configured demo accounts for testing:

- **Admin**: admin@demo.com / demo123
- **Sales Manager**: manager@demo.com / demo123
- **Sales Executive**: exec@demo.com / demo123

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application pages
│   │   ├── leads/         # Lead management
│   │   ├── pipeline/      # Sales pipeline
│   │   ├── campaigns/     # Email campaigns
│   │   ├── analytics/     # Advanced analytics
│   │   ├── content/       # Content library
│   │   └── help/          # Help center
│   └── api/               # API routes
├── components/            # Reusable React components
├── lib/                   # Utility functions and services
│   ├── ai/               # AI scoring algorithms
│   ├── content/          # Templates and playbooks
│   └── services/         # Database services
├── types/                 # TypeScript definitions
├── supabase/             # Database schema
└── public/               # Static assets
```

## 🎯 Key Components

### AI Lead Scoring Engine
Advanced machine learning algorithm that evaluates:

**Industry Analysis (25% weight)**
- Market growth trends and maturity
- Typical buying patterns and cycles
- Competition levels and market dynamics

**Role & Authority Assessment (20% weight)**
- Decision-making power and budget authority
- Organizational influence and seniority
- Stakeholder involvement patterns

**Source Quality Evaluation (15% weight)**
- Historical conversion rates by source
- Lead source reliability and engagement
- Attribution and tracking accuracy

**Engagement Scoring (20% weight)**
- Email opens, clicks, and responses
- Website behavior and content consumption
- Social media interactions and shares

**Company Intelligence (10% weight)**
- Company size, growth stage, and funding
- Technology stack and integration needs
- Recent news and market position

**Timing & Context (10% weight)**
- Seasonality and market conditions
- Recent company events and triggers
- Competitive landscape changes

### Smart Recommendation System
AI-powered suggestions include:

**Contact Priority Recommendations**
- Who to contact first based on conversion probability
- Optimal contact sequences for multi-stakeholder deals
- Resource allocation suggestions

**Timing Optimization**
- Best times to reach out based on industry patterns
- Follow-up timing recommendations
- Campaign scheduling optimization

**Channel Preferences**
- Email vs. phone vs. LinkedIn effectiveness
- Personalized communication preferences
- Multi-channel sequence recommendations

**Content Suggestions**
- Industry-specific messaging and case studies
- Personalized email templates and subject lines
- Relevant content and resources to share

### Content Management System
Comprehensive library including:

**Email Templates**
- Cold outreach sequences
- Follow-up campaigns
- Nurture email series
- Proposal and closing templates
- Industry-specific variations

**Sales Playbooks**
- Step-by-step methodologies
- Industry-specific processes
- Role-based approaches
- Success metrics and KPIs

**Market Insights**
- Industry trend analysis
- Competitive intelligence
- Best practice guides
- Performance benchmarks

## 🔧 Customization

### Adding New Industries
Update industry scoring in `lib/ai/leadScoring.ts`:
```typescript
private static industryWeights: Record<string, number> = {
  'SaaS': 0.92,
  'FinTech': 0.88,
  'YourIndustry': 0.85, // Add new industry
}
```

### Custom Email Templates
Add templates in `lib/content/templates.ts`:
```typescript
{
  id: 'custom-template',
  name: 'Custom Template Name',
  subject: 'Your subject with {{variables}}',
  content: 'Template content...',
  category: 'cold_outreach',
  variables: ['first_name', 'company_name'],
  industry: 'YourIndustry'
}
```

### Extending AI Scoring
Modify the scoring algorithm in `lib/ai/leadScoring.ts` to include:
- Additional data sources
- Custom weighting factors
- Industry-specific rules
- Integration with external APIs

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
Compatible with:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform
- Any Node.js hosting provider

### Production Checklist
- [ ] Set up production Supabase project
- [ ] Configure environment variables
- [ ] Set up email service (SendGrid, Mailgun, etc.)
- [ ] Configure domain and SSL
- [ ] Set up monitoring and analytics
- [ ] Test all integrations

## 📈 Advanced Features

### Real-time Collaboration
- Live lead updates across team members
- Real-time notifications and alerts
- Collaborative lead notes and activities
- Team performance dashboards

### API Integration
- RESTful API for external integrations
- Webhook support for real-time updates
- CRM synchronization capabilities
- Third-party tool connections

### Advanced Analytics
- Cohort analysis and retention metrics
- A/B testing for email campaigns
- Predictive pipeline forecasting
- Custom reporting and dashboards

### Security Features
- Row Level Security (RLS) with Supabase
- Role-based access control
- Data encryption at rest and in transit
- Audit logging and compliance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Getting Started Guide](./docs/getting-started.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

### Community
- GitHub Issues for bug reports
- GitHub Discussions for questions
- Email: support@leadiqpro.com

### Enterprise Support
- Dedicated support team
- Custom integrations
- Training and onboarding
- SLA guarantees

---

Built with ❤️ for modern sales teams who want to work smarter, not harder.

**Transform your sales process with AI-powered lead intelligence.**