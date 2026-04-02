-- Allow anyone to read venues by slug (for public website)
CREATE POLICY "Public can view venues by slug" ON venues
  FOR SELECT USING (slug IS NOT NULL);

-- Allow anyone to read published website pages (for public website)
CREATE POLICY "Public can view published pages" ON website_pages
  FOR SELECT USING (is_published = true);
