-- Remove all existing demo data and ensure clean production tables
-- This script cleans the database and sets it up for production use

-- First, clear any existing demo data
DELETE FROM activities;
DELETE FROM notifications;
DELETE FROM settings;
DELETE FROM tasks;
DELETE FROM contracts;
DELETE FROM jobs;
DELETE FROM customers;
DELETE FROM contractors;
DELETE FROM users;
DELETE FROM organizations;

-- Reset sequences and clean up
VACUUM;

-- Ensure we have a clean slate for production
-- The tables are ready to receive real production data