-- Add SEO/meta fields to website_pages
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
