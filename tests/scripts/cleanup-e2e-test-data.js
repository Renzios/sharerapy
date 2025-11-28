/**
 * Simple E2E Test Data Cleanup Script (No TypeScript dependencies)
 * 
 * This script removes all test data from Supabase that contains test identifiers
 * 
 * Usage: node scripts/cleanup-e2e-test-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

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