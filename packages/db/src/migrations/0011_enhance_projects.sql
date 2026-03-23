-- Migration: Enhance projects table with advanced fields
-- Add header image for project detail page banner
ALTER TABLE projects ADD COLUMN header_image_url TEXT;

-- Add metrics JSON for project statistics (area, duration, budget, etc.)
ALTER TABLE projects ADD COLUMN metrics TEXT;

-- Add tags JSON array
ALTER TABLE projects ADD COLUMN tags TEXT;

-- Add video URL for embedded videos
ALTER TABLE projects ADD COLUMN video_url TEXT;

-- Add testimonial fields
ALTER TABLE projects ADD COLUMN testimonial TEXT;
ALTER TABLE projects ADD COLUMN testimonial_author TEXT;
ALTER TABLE projects ADD COLUMN testimonial_author_title TEXT;

-- Add project status (completed, in_progress, planned)
ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'completed';

-- Add start date
ALTER TABLE projects ADD COLUMN start_date TEXT;

-- Add is_featured flag (was only in overrides before)
ALTER TABLE projects ADD COLUMN is_featured INTEGER DEFAULT 0;

-- Add sort_order (was only in overrides before)
ALTER TABLE projects ADD COLUMN sort_order INTEGER DEFAULT 0;
