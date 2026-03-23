-- Migration: Enhance articles table with tags, keywords, SEO fields, and published_at
-- Add new columns to articles table
ALTER TABLE articles ADD COLUMN tags TEXT;
ALTER TABLE articles ADD COLUMN keywords TEXT;
ALTER TABLE articles ADD COLUMN meta_title_en TEXT;
ALTER TABLE articles ADD COLUMN meta_description_en TEXT;
ALTER TABLE articles ADD COLUMN published_at TEXT;

-- Add new columns to site_article_overrides table
ALTER TABLE site_article_overrides ADD COLUMN tags TEXT;
ALTER TABLE site_article_overrides ADD COLUMN keywords TEXT;
ALTER TABLE site_article_overrides ADD COLUMN meta_title_en TEXT;
ALTER TABLE site_article_overrides ADD COLUMN meta_description_en TEXT;
ALTER TABLE site_article_overrides ADD COLUMN published_at TEXT;
