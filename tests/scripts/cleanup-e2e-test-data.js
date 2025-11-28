/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Try multiple paths for .env.local
const possiblePaths = [
  '.env.local',                    // From project root
  '../../.env.local',              // From scripts directory  
  path.join(__dirname, '../../.env.local'), // Absolute from current file
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  try {
    require('dotenv').config({ path: envPath });
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.log(`Environment loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (err) {
    console.error(`Failed to load .env from ${envPath}: ${err.message}`);
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

/**
 * Clean up reports containing test data
 */
async function cleanupReports() {
  console.log('Cleaning up test reports...');
  
  let totalDeleted = 0;
  
  for (const identifier of TEST_IDENTIFIERS) {
    try {
      // Delete reports by title
      const { data: reports, error } = await supabase
        .from('reports')
        .delete()
        .or(`title.ilike.%${identifier}%,description.ilike.%${identifier}%`);
      
      if (error) {
        console.error(`Error deleting reports with "${identifier}":`, error.message);
      } else if (reports && reports.length > 0) {
        console.log(`Deleted ${reports.length} reports containing "${identifier}"`);
        totalDeleted += reports.length;
      }
    } catch (err) {
      console.error(`Error processing "${identifier}":`, err.message);
    }
  }
  
  return totalDeleted;
}

/**
 * Main function to run cleanup operations
 */
async function main() {
  console.log('Starting E2E test data cleanup...');
  
  try {
    const deletedCount = await cleanupReports();
    console.log(`Cleanup completed! Deleted ${deletedCount} test records total.`);
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);