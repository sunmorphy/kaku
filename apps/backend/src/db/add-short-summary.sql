-- Add 'short_summary' column to users table
-- This is separate from the existing 'summary' column

DO $$ 
BEGIN
    -- Check if short_summary column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'short_summary'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN short_summary TEXT;
        
        RAISE NOTICE 'Added short_summary column to users table';
    ELSE
        RAISE NOTICE 'Short_summary column already exists in users table';
    END IF;
END $$;