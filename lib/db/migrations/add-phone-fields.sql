-- Add phone number and phone country columns to users table
ALTER TABLE users 
ADD COLUMN phone_number VARCHAR(20),
ADD COLUMN phone_country VARCHAR(5);