-- ============================================================
-- LeadIQ Pro — Seed Data
-- Run this AFTER schema.sql in the Supabase SQL editor
-- ============================================================

DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

-- Insert a placeholder user row so FK constraints pass
INSERT INTO users (id, email, name, role) VALUES
  (demo_user_id, 'admin@demo.com', 'Admin User', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Leads
INSERT INTO leads (name, company, role, industry, location, source, engagement_score, ai_score, conversion_probability, category, status, email, phone, notes, predicted_lifetime_value, created_by) VALUES
  ('Sarah Chen', 'TechFlow Inc', 'VP of Engineering', 'SaaS', 'San Francisco, CA', 'LinkedIn', 87, 92, 78.5, 'hot', 'qualified', 'sarah.chen@techflow.com', '+1-415-555-0101', 'Very interested in enterprise plan. Follow up on pricing.', 85000, demo_user_id),
  ('Marcus Johnson', 'DataPulse Analytics', 'CTO', 'Analytics', 'New York, NY', 'Website', 72, 85, 65.2, 'hot', 'contacted', 'marcus.j@datapulse.io', '+1-212-555-0102', 'Evaluating 3 vendors. Decision in 2 weeks.', 120000, demo_user_id),
  ('Emily Rodriguez', 'CloudNine Solutions', 'Head of Sales', 'Cloud Services', 'Austin, TX', 'Referral', 91, 88, 82.1, 'hot', 'proposal', 'emily.r@cloudnine.com', '+1-512-555-0103', 'Referred by existing customer. High intent.', 95000, demo_user_id),
  ('James Park', 'FinEdge Capital', 'Director of Operations', 'FinTech', 'Chicago, IL', 'Email Campaign', 58, 71, 48.3, 'warm', 'new', 'j.park@finedge.com', NULL, 'Downloaded whitepaper. Nurture sequence active.', 65000, demo_user_id),
  ('Priya Patel', 'MedTech Innovations', 'Product Manager', 'Healthcare', 'Boston, MA', 'LinkedIn', 64, 74, 52.7, 'warm', 'contacted', 'priya.p@medtech.io', '+1-617-555-0105', 'Interested in API integration capabilities.', 78000, demo_user_id),
  ('David Kim', 'RetailBoost', 'CEO', 'E-commerce', 'Seattle, WA', 'Website', 45, 62, 38.9, 'warm', 'new', 'd.kim@retailboost.com', '+1-206-555-0106', 'Early stage evaluation. Budget not confirmed.', 45000, demo_user_id),
  ('Lisa Thompson', 'GreenEnergy Corp', 'VP Marketing', 'Energy', 'Denver, CO', 'Referral', 33, 48, 22.4, 'cold', 'new', 'l.thompson@greenenergy.com', NULL, 'Attended webinar. Low engagement since.', 30000, demo_user_id),
  ('Robert Martinez', 'LogiChain Systems', 'IT Director', 'Logistics', 'Miami, FL', 'Email Campaign', 28, 41, 18.6, 'cold', 'new', 'r.martinez@logichain.com', NULL, 'Subscribed to newsletter. No further action.', 25000, demo_user_id),
  ('Amanda Foster', 'EduTech Pro', 'Head of Product', 'EdTech', 'Portland, OR', 'LinkedIn', 79, 83, 69.4, 'hot', 'qualified', 'a.foster@edutech.pro', '+1-503-555-0109', 'Strong product fit. Needs security review.', 72000, demo_user_id),
  ('Kevin Zhang', 'AutoScale AI', 'Founder', 'AI/ML', 'San Jose, CA', 'Website', 95, 97, 91.2, 'hot', 'proposal', 'kevin@autoscale.ai', '+1-408-555-0110', 'Ready to buy. Finalizing contract terms.', 150000, demo_user_id);

-- Recommendations for top leads
INSERT INTO recommendations (lead_id, type, message, priority)
SELECT id, 'contact_priority', 'High conversion probability — reach out within 24 hours', 'high'
FROM leads WHERE ai_score >= 85;

INSERT INTO recommendations (lead_id, type, message, priority)
SELECT id, 'follow_up', 'Send personalized case study based on their industry', 'medium'
FROM leads WHERE category = 'warm';

-- Sample activities
INSERT INTO lead_activities (lead_id, user_id, type, description)
SELECT l.id, demo_user_id, 'email_sent', 'Sent initial outreach email with product overview'
FROM leads l WHERE l.status != 'new';

INSERT INTO lead_activities (lead_id, user_id, type, description)
SELECT l.id, demo_user_id, 'note_added', 'Initial contact made. Prospect showed interest in enterprise features.'
FROM leads l WHERE l.category = 'hot';

-- Sample campaigns
INSERT INTO campaigns (name, description, type, status, target_criteria, stats, created_by) VALUES
  ('SaaS High-Value Outreach', 'Target high-scoring SaaS leads with personalized value proposition', 'email', 'active',
   '{"categories": ["hot", "warm"], "industries": ["SaaS"], "minScore": 70}'::jsonb,
   '{"totalTargets": 45, "contacted": 32, "opened": 18, "replied": 7, "converted": 2}'::jsonb,
   demo_user_id),
  ('FinTech LinkedIn Sequence', 'Multi-touch LinkedIn campaign for FinTech decision makers', 'linkedin', 'paused',
   '{"industries": ["FinTech"], "minScore": 60}'::jsonb,
   '{"totalTargets": 28, "contacted": 15, "opened": 12, "replied": 4, "converted": 1}'::jsonb,
   demo_user_id),
  ('Healthcare Nurture Campaign', 'Educational content series for healthcare prospects', 'email', 'draft',
   '{"industries": ["Healthcare"], "categories": ["warm", "cold"]}'::jsonb,
   '{"totalTargets": 67, "contacted": 0, "opened": 0, "replied": 0, "converted": 0}'::jsonb,
   demo_user_id);

END $$;
