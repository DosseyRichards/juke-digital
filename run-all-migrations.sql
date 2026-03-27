-- Run ALL pending migrations in one shot

-- 1. Venue slug and theme
ALTER TABLE venues ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS website_theme JSONB DEFAULT '{"primaryColor":"#6366f1","backgroundColor":"#0f0f13","textColor":"#f0f0f5","fontFamily":"Inter","heroStyle":"gradient"}';

-- 2. Media library table
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
DO $$ BEGIN
  CREATE POLICY "Media for venue owners" ON media FOR ALL USING (
    venue_id IN (SELECT id FROM venues WHERE owner_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. SEO fields on website_pages
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
