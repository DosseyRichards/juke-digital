-- Add slug to venues for unique URLs
ALTER TABLE venues ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS website_theme JSONB DEFAULT '{"primaryColor":"#6366f1","backgroundColor":"#0f0f13","textColor":"#f0f0f5","fontFamily":"Inter","heroStyle":"gradient"}';

-- Media library
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media for venue owners" ON media FOR ALL USING (
  venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
);

-- Storage bucket (run this or create via dashboard)
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT DO NOTHING;

-- Storage policy for authenticated uploads
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');
