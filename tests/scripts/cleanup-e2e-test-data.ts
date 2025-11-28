#!/usr/bin/env tsx

/**
 * E2E Test Data Cleanup Script
 * 
 * This script removes all test data from Supabase that contains "E2E_TEST" 
 * or other test identifiers to keep the database clean after E2E test runs.
 * 
 * Usage: npx tsx scripts/cleanup-e2e-test-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database.types';

// Create Supabase client for server-side operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
);

interface CleanupStats {
  reports: number;
  patients: number;
  therapists: number;
  total: number;
}

/**
 * Test data identifiers to clean up
 */
const TEST_IDENTIFIERS = [
  'E2E_TEST',
  'Normal Report Title',
  'Test Report Title',
  'This is a very long title that definitely exceeds one hundred characters',
  'Normal Title',
  'John', // Test first name
  'Doe'   // Test last name
];

/**
 * Clean up reports containing test data
 */
async function cleanupReports(): Promise<number> {
  console.log('🧹 Cleaning up test reports...');
  
  let totalDeleted = 0;
  
  for (const identifier of TEST_IDENTIFIERS) {
    // Delete reports by title
    const { data: titleReports, error: titleError } = await supabase
      .from('reports')
      .delete()
      .ilike('title', `%${identifier}%`);
    
    if (titleError) {
      console.error(`❌ Error deleting reports by title "${identifier}":`, titleError);
    } else {
      const deletedCount = titleReports?.length || 0;
      if (deletedCount > 0) {
        console.log(`   ✅ Deleted ${deletedCount} reports with title containing "${identifier}"`);
        totalDeleted += deletedCount;
      }
    }
    
    // Delete reports by description
    const { data: descReports, error: descError } = await supabase
      .from('reports')
      .delete()
      .ilike('description', `%${identifier}%`);
    
    if (descError) {
      console.error(`❌ Error deleting reports by description "${identifier}":`, descError);
    } else {
      const deletedCount = descReports?.length || 0;
      if (deletedCount > 0) {
        console.log(`   ✅ Deleted ${deletedCount} reports with description containing "${identifier}"`);
        totalDeleted += deletedCount;
      }
    }
  }
  
  return totalDeleted;
}

/**
 * Clean up patients containing test data
 */
async function cleanupPatients(): Promise<number> {
  console.log('🧹 Cleaning up test patients...');
  
  let totalDeleted = 0;
  
  for (const identifier of TEST_IDENTIFIERS) {
    // Delete patients by first name
    const { data: firstNamePatients, error: firstNameError } = await supabase
      .from('patients')
      .delete()
      .ilike('first_name', `%${identifier}%`);
    
    if (firstNameError) {
      console.error(`❌ Error deleting patients by first name "${identifier}":`, firstNameError);
    } else {
      const deletedCount = firstNamePatients?.length || 0;
      if (deletedCount > 0) {
        console.log(`   ✅ Deleted ${deletedCount} patients with first name containing "${identifier}"`);
        totalDeleted += deletedCount;
      }
    }
    
    // Delete patients by last name
    const { data: lastNamePatients, error: lastNameError } = await supabase
      .from('patients')
      .delete()
      .ilike('last_name', `%${identifier}%`);
    
    if (lastNameError) {
      console.error(`❌ Error deleting patients by last name "${identifier}":`, lastNameError);
    } else {
      const deletedCount = lastNamePatients?.length || 0;
      if (deletedCount > 0) {
        console.log(`   ✅ Deleted ${deletedCount} patients with last name containing "${identifier}"`);
        totalDeleted += deletedCount;
      }
    }
  }
  
  return totalDeleted;
}

/**
 * Clean up therapists containing test data
 */
async function cleanupTherapists(): Promise<number> {
  console.log('🧹 Cleaning up test therapists...');
  
  let totalDeleted = 0;
  
  for (const identifier of TEST_IDENTIFIERS) {
    const { data: therapists, error } = await supabase
      .from('therapists')
      .delete()
      .or(`first_name.ilike.%${identifier}%,last_name.ilike.%${identifier}%,email.ilike.%${identifier}%`);
    
    if (error) {
      console.error(`❌ Error deleting therapists with "${identifier}":`, error);
    } else {
      const deletedCount = therapists?.length || 0;
      if (deletedCount > 0) {
        console.log(`   ✅ Deleted ${deletedCount} therapists containing "${identifier}"`);
        totalDeleted += deletedCount;
      }
    }
  }
  
  return totalDeleted;
}

/**
 * Clean up test data created with specific test phone numbers
 */
async function cleanupByTestPhoneNumbers(): Promise<number> {
  console.log('🧹 Cleaning up test data by phone numbers...');
  
  const testPhoneNumbers = [
    '+1234567890',
    '+9876543210', 
    '+5555551234',
    '+1122334455',
    '+0000000000',
    '1234567890'
  ];
  
  let totalDeleted = 0;
  
  for (const phoneNumber of testPhoneNumbers) {
    const { data: patients, error } = await supabase
      .from('patients')
      .delete()
      .eq('contact_number', phoneNumber);
    
    if (error) {
      console.error(`❌ Error deleting patients with phone "${phoneNumber}":`, error);
    } else {
      const deletedCount = patients?.length || 0;
      if (deletedCount > 0) {
        console.log(`   ✅ Deleted ${deletedCount} patients with phone number "${phoneNumber}"`);
        totalDeleted += deletedCount;
      }
    }
  }
  
  return totalDeleted;
}

/**
 * Clean up test data created in the last 24 hours with test patterns
 */
async function cleanupRecentTestData(): Promise<number> {
  console.log('🧹 Cleaning up recent test data (last 24 hours)...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  let totalDeleted = 0;
  
  // Clean up reports created in last 24 hours with test content
  const { data: recentReports, error: reportsError } = await supabase
    .from('reports')
    .delete()
    .gte('created_at', yesterday.toISOString())
    .or('title.ilike.%test%,description.ilike.%test%,description.ilike.%E2E%');
  
  if (reportsError) {
    console.error('❌ Error deleting recent test reports:', reportsError);
  } else {
    const deletedCount = recentReports?.length || 0;
    if (deletedCount > 0) {
      console.log(`   ✅ Deleted ${deletedCount} recent test reports`);
      totalDeleted += deletedCount;
    }
  }
  
  // Clean up patients created in last 24 hours with test data
  const { data: recentPatients, error: patientsError } = await supabase
    .from('patients')
    .delete()
    .gte('created_at', yesterday.toISOString())
    .or('first_name.ilike.%test%,last_name.ilike.%test%');
  
  if (patientsError) {
    console.error('❌ Error deleting recent test patients:', patientsError);
  } else {
    const deletedCount = recentPatients?.length || 0;
    if (deletedCount > 0) {
      console.log(`   ✅ Deleted ${deletedCount} recent test patients`);
      totalDeleted += deletedCount;
    }
  }
  
  return totalDeleted;
}

/**
 * Main cleanup function
 */
async function main() {
  console.log('🚀 Starting E2E test data cleanup...\n');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  const stats: CleanupStats = {
    reports: 0,
    patients: 0,
    therapists: 0,
    total: 0
  };
  
  try {
    // Clean up in order (reports first due to foreign key constraints)
    stats.reports = await cleanupReports();
    stats.patients = await cleanupPatients();
    stats.therapists = await cleanupTherapists();
    
    // Clean up by phone numbers
    const phoneCleanup = await cleanupByTestPhoneNumbers();
    stats.patients += phoneCleanup;
    
    // Clean up recent test data
    const recentCleanup = await cleanupRecentTestData();
    stats.total += recentCleanup;
    
    stats.total = stats.reports + stats.patients + stats.therapists + recentCleanup;
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`   Reports deleted: ${stats.reports}`);
    console.log(`   Patients deleted: ${stats.patients}`);
    console.log(`   Therapists deleted: ${stats.therapists}`);
    console.log(`   Total records deleted: ${stats.total}`);
    
    if (stats.total > 0) {
      console.log('\n✅ E2E test data cleanup completed successfully!');
    } else {
      console.log('\n✅ No test data found to clean up.');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as cleanupE2ETestData };