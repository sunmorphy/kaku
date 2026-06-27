-- Add 'pseudonym' and 'banner_image_path' columns to users table
-- pseudonym: alternative/artist name
-- banner_image_path: URL to banner/header image

DO $$ 
BEGIN
    -- Check if pseudonym column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'pseudonym'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN pseudonym VARCHAR(100);
        
        RAISE NOTICE 'Added pseudonym column to users table';
    ELSE
        RAISE NOTICE 'Pseudonym column already exists in users table';
    END IF;

    -- Check if banner_image_path column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'banner_image_path'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN banner_image_path TEXT;
        
        RAISE NOTICE 'Added banner_image_path column to users table';
    ELSE
        RAISE NOTICE 'Banner_image_path column already exists in users table';
    END IF;
END $$;