-- Juke Digital - Bar Management Platform Schema
-- Run this in your Supabase SQL Editor

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'bartender', 'server', 'host', 'barback')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venues / Bars
CREATE TABLE IF NOT EXISTS venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  logo_url TEXT,
  website_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venue members (employees)
CREATE TABLE IF NOT EXISTS venue_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'server' CHECK (role IN ('manager', 'bartender', 'server', 'host', 'barback')),
  hourly_rate DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  hired_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, user_id)
);

-- Calendar events
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  event_type TEXT DEFAULT 'general' CHECK (event_type IN ('general', 'shift', 'private_event', 'promotion', 'meeting', 'holiday')),
  color TEXT DEFAULT '#6366f1',
  is_all_day BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (for SMS management)
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  tags TEXT[] DEFAULT '{}',
  opted_in BOOLEAN DEFAULT TRUE,
  notes TEXT,
  visit_count INTEGER DEFAULT 0,
  last_visit TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS campaigns
CREATE TABLE IF NOT EXISTS sms_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  target_tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS messages log
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES sms_campaigns(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  direction TEXT DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website pages (for website creator)
CREATE TABLE IF NOT EXISTS website_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, slug)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Venue owners can manage venues" ON venues FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Venue members can view venues" ON venues FOR SELECT USING (
  id IN (SELECT venue_id FROM venue_members WHERE user_id = auth.uid())
);

CREATE POLICY "Venue access for members" ON venue_members FOR SELECT USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid()) OR user_id = auth.uid()
);
CREATE POLICY "Venue owners manage members" ON venue_members FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

CREATE POLICY "Events visible to venue members" ON events FOR SELECT USING (
  venue_id IN (SELECT venue_id FROM venue_members WHERE user_id = auth.uid())
  OR venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);
CREATE POLICY "Events managed by owners/managers" ON events FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

CREATE POLICY "Customers visible to venue" ON customers FOR SELECT USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  OR venue_id IN (SELECT venue_id FROM venue_members WHERE user_id = auth.uid())
);
CREATE POLICY "Customers managed by owners" ON customers FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

CREATE POLICY "SMS campaigns visible to venue" ON sms_campaigns FOR SELECT USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);
CREATE POLICY "SMS campaigns managed by owners" ON sms_campaigns FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

CREATE POLICY "SMS messages visible to venue" ON sms_messages FOR SELECT USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);
CREATE POLICY "SMS messages managed by owners" ON sms_messages FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

CREATE POLICY "Website pages visible to venue" ON website_pages FOR SELECT USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);
CREATE POLICY "Website pages managed by owners" ON website_pages FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
