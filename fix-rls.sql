-- Drop all existing policies
DROP POLICY IF EXISTS "Venue owners can manage venues" ON venues;
DROP POLICY IF EXISTS "Venue members can view venues" ON venues;
DROP POLICY IF EXISTS "Venue access for members" ON venue_members;
DROP POLICY IF EXISTS "Venue owners manage members" ON venue_members;
DROP POLICY IF EXISTS "Events visible to venue members" ON events;
DROP POLICY IF EXISTS "Events managed by owners/managers" ON events;
DROP POLICY IF EXISTS "Customers visible to venue" ON customers;
DROP POLICY IF EXISTS "Customers managed by owners" ON customers;
DROP POLICY IF EXISTS "SMS campaigns visible to venue" ON sms_campaigns;
DROP POLICY IF EXISTS "SMS campaigns managed by owners" ON sms_campaigns;
DROP POLICY IF EXISTS "SMS messages visible to venue" ON sms_messages;
DROP POLICY IF EXISTS "SMS messages managed by owners" ON sms_messages;
DROP POLICY IF EXISTS "Website pages visible to venue" ON website_pages;
DROP POLICY IF EXISTS "Website pages managed by owners" ON website_pages;

-- VENUES: owner can do everything, members can SELECT only (no cross-table lookup)
CREATE POLICY "Venue owners can manage venues" ON venues
  FOR ALL USING (owner_id = auth.uid());

-- VENUE_MEMBERS: direct user_id check, no subquery into venues
CREATE POLICY "Members can view own membership" ON venue_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owners manage members" ON venue_members
  FOR ALL USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

-- EVENTS: owner check via venues (no recursion since venues policy is simple)
CREATE POLICY "Events for venue owners" ON events
  FOR ALL USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

CREATE POLICY "Events visible to members" ON events
  FOR SELECT USING (
    venue_id IN (SELECT venue_id FROM venue_members WHERE user_id = auth.uid())
  );

-- CUSTOMERS
CREATE POLICY "Customers for venue owners" ON customers
  FOR ALL USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

CREATE POLICY "Customers visible to members" ON customers
  FOR SELECT USING (
    venue_id IN (SELECT venue_id FROM venue_members WHERE user_id = auth.uid())
  );

-- SMS CAMPAIGNS
CREATE POLICY "SMS campaigns for venue owners" ON sms_campaigns
  FOR ALL USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

-- SMS MESSAGES
CREATE POLICY "SMS messages for venue owners" ON sms_messages
  FOR ALL USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );

-- WEBSITE PAGES
CREATE POLICY "Website pages for venue owners" ON website_pages
  FOR ALL USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );
