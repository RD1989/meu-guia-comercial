
-- =========================================================
-- SEO & Social Upgrade for Businesses
-- =========================================================

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT;

-- Index for featured status for better performance in the frontpage
CREATE INDEX IF NOT EXISTS idx_businesses_featured ON public.businesses(featured) WHERE (featured = true AND active = true);
