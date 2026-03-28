-- Add custom domain field to venues
ALTER TABLE venues ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;
