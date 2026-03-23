-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'sales_manager', 'sales_executive')) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  source VARCHAR(100) NOT NULL,
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  ai_score INTEGER DEFAULT 0 CHECK (ai_score >= 0 AND ai_score <= 100),
  conversion_probability DECIMAL(5,2) DEFAULT 0 CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
  category VARCHAR(10) CHECK (category IN ('hot', 'warm', 'cold')) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'converted', 'lost')) DEFAULT 'new',
  email VARCHAR(255),
  phone VARCHAR(50),
  notes TEXT,
  predicted_lifetime_value INTEGER,
  intent_level VARCHAR(20) CHECK (intent_level IN ('high', 'medium', 'low')),
  assigned_to UUID REFERENCES users(id),
  tags TEXT[],
  custom_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) NOT NULL
);

-- Create lead_activities table
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('email_sent', 'email_opened', 'call_made', 'meeting_scheduled', 'note_added', 'status_changed', 'document_sent')) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) CHECK (type IN ('contact_priority', 'best_time', 'channel_preference', 'follow_up', 'content_suggestion')) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  variables TEXT[],
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) CHECK (type IN ('email', 'linkedin', 'phone', 'mixed')) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
  target_criteria JSONB NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  stats JSONB DEFAULT '{"totalTargets":0,"contacted":0,"opened":0,"replied":0,"converted":0}'::jsonb,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_category ON leads(category);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON leads(created_by);
CREATE INDEX IF NOT EXISTS idx_leads_ai_score ON leads(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_lead_id ON recommendations(lead_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_is_read ON recommendations(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can read all leads" ON leads;
DROP POLICY IF EXISTS "Users can insert leads" ON leads;
DROP POLICY IF EXISTS "Users can update leads they created or are assigned to" ON leads;
DROP POLICY IF EXISTS "Service role bypass leads" ON leads;
DROP POLICY IF EXISTS "Users can read activities for accessible leads" ON lead_activities;
DROP POLICY IF EXISTS "Users can insert activities" ON lead_activities;
DROP POLICY IF EXISTS "Users can read all recommendations" ON recommendations;
DROP POLICY IF EXISTS "Users can update recommendation read status" ON recommendations;
DROP POLICY IF EXISTS "Users can read all templates" ON email_templates;
DROP POLICY IF EXISTS "Users can insert templates" ON email_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON email_templates;
DROP POLICY IF EXISTS "Users can read all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update own campaigns" ON campaigns;

-- RLS Policies
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Leads: allow service role full access (needed for CSV upload via API routes)
CREATE POLICY "Users can read all leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Users can insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update leads they created or are assigned to" ON leads FOR UPDATE USING (true);
CREATE POLICY "Users can delete leads" ON leads FOR DELETE USING (true);

-- Activities
CREATE POLICY "Users can read activities for accessible leads" ON lead_activities FOR SELECT USING (true);
CREATE POLICY "Users can insert activities" ON lead_activities FOR INSERT WITH CHECK (true);

-- Recommendations
CREATE POLICY "Users can read all recommendations" ON recommendations FOR SELECT USING (true);
CREATE POLICY "Users can update recommendation read status" ON recommendations FOR UPDATE USING (true);

-- Templates
CREATE POLICY "Users can read all templates" ON email_templates FOR SELECT USING (true);
CREATE POLICY "Users can insert templates" ON email_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own templates" ON email_templates FOR UPDATE USING (true);

-- Campaigns
CREATE POLICY "Users can read all campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Users can insert campaigns" ON campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE USING (true);
