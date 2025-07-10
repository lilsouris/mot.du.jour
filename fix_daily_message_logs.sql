-- Fix daily_message_logs table to use integer user_id
-- Run this SQL in your Supabase SQL Editor

-- First, drop the existing table if it exists with wrong schema
DROP TABLE IF EXISTS daily_message_logs;

-- Create the table with correct data types
CREATE TABLE daily_message_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    message_content TEXT NOT NULL,
    message_hash TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    twilio_sid TEXT,
    error_message TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_message_logs_user_id ON daily_message_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_message_logs_message_hash ON daily_message_logs(message_hash);
CREATE INDEX IF NOT EXISTS idx_daily_message_logs_sent_at ON daily_message_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_daily_message_logs_user_hash ON daily_message_logs(user_id, message_hash);

-- Enable Row Level Security
ALTER TABLE daily_message_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own message logs" ON daily_message_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage all message logs" ON daily_message_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON daily_message_logs TO service_role;
GRANT SELECT ON daily_message_logs TO authenticated;