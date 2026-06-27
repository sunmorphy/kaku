-- Add 'role' column to users table
-- Role describes the user's job/profession (e.g., "Artist", "Designer", "Photographer", etc.)

DO $$ 
BEGIN
    -- Check if role column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(100);
        
        RAISE NOTICE 'Added role column to users table';
    ELSE
        RAISE NOTICE 'Role column already exists in users table';
    END IF;
END $$;