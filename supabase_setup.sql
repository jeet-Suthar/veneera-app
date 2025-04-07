-- Create users table
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, fname TEXT NOT NULL, email TEXT, total_patients INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
-- Create patients table
CREATE TABLE IF NOT EXISTS patients (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL, fname TEXT NOT NULL, lname TEXT, age INTEGER, address TEXT, notes TEXT, next_appointment TEXT, last_visited TIMESTAMP WITH TIME ZONE, first_visited TIMESTAMP WITH TIME ZONE, ai_pic TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
-- Create increment function
CREATE OR REPLACE FUNCTION increment(row_id TEXT) RETURNS INTEGER AS $$ DECLARE new_count INTEGER; BEGIN UPDATE users SET total_patients = total_patients + 1 WHERE id = row_id RETURNING total_patients INTO new_count; RETURN new_count; END; $$ LANGUAGE plpgsql;
