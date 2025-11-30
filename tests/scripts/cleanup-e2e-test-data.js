/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Try to load environment variables from .env.local files (for local development)
// In GitHub Actions, these variables are already in process.env
const possiblePaths = [
  '.env.local',                    // From project root
  '../../.env.local',              // From scripts directory  
  path.join(__dirname, '../../.env.local'), // Absolute from current file
];

let envLoaded = false;

// First check if environment variables are already available (GitHub Actions case)
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  console.log('Environment variables already available (likely GitHub Actions)');
  envLoaded = true;
} else {
  // Try loading from .env.local files (local development)
  for (const envPath of possiblePaths) {
    try {
      require('dotenv').config({ path: envPath });
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        console.log(`Environment loaded from: ${envPath}`);
        envLoaded = true;
        break;
      }
    } catch {
    }
  }
}

if (!envLoaded) {
  console.error('Could not load environment variables from any location');
  console.error('Tried paths:', possiblePaths);
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY // Use available key from env.local
);
const TEST_IDENTIFIERS = [
  '[E2E_TEST]'
];

const TEST_PATIENT_NAMES = [
  'TestFirst',
  'TestLast'
];

/**
 * Clean up reports containing test data
 */
async function cleanupReports() {
  console.log('Cleaning up test reports...');
  
  // Clean up by test identifiers in title/description
  for (const identifier of TEST_IDENTIFIERS) {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .or(`title.ilike.%${identifier}%,description.ilike.%${identifier}%`);
      
      if (error) {
        console.error(`Error deleting reports with "${identifier}":`, error.message);
      } else {
        console.log(`Deleted reports containing "${identifier}"`);
      }
    } catch (err) {
      console.error(`Error processing "${identifier}":`, err.message);
    }
  }
  
  // Clean up by test patient names
  for (const testName of TEST_PATIENT_NAMES) {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .or(`first_name.ilike.%${testName}%,last_name.ilike.%${testName}%`);
      
      if (error) {
        console.error(`Error deleting patients with name "${testName}":`, error.message);
      } else {
        console.log(`Deleted patients with name "${testName}"`);
      }
    } catch (err) {
      console.error(`Error processing patient name "${testName}":`, err.message);
    }
  }
}

/**
 * Main function to run cleanup operations
 */
async function main() {
  console.log('Starting E2E test data cleanup...');
  
  try {
    await cleanupReports();
    console.log('Cleanup completed!');
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);