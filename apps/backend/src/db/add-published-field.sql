-- Add published field to artworks, projects, and animations tables
-- Default to true to keep existing content visible

-- Add published field to artworks
ALTER TABLE artworks 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

-- Add published field to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

-- Add published field to animations
ALTER TABLE animations 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_artworks_published ON artworks(published);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_animations_published ON animations(published);
