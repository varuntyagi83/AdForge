#!/usr/bin/env tsx
/**
 * Cleanup orphaned metadata - Local version
 * Runs directly against Supabase and Google Drive APIs without needing Vercel
 */

import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Google Drive credentials
const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL!
const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n')!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

if (!clientEmail || !privateKey) {
  console.error('❌ Missing Google Drive credentials')
  console.error('   Need: GOOGLE_DRIVE_CLIENT_EMAIL, GOOGLE_DRIVE_PRIVATE_KEY')
  console.error('   These are only available in Vercel environment variables')
  console.error('   Please run this from Vercel or add them to .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Initialize Google Drive
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
})

const drive = google.drive({ version: 'v3', auth })

async function cleanupOrphanedMetadata(dryRun: boolean = true) {
  console.log(`🔍 Scanning for orphaned metadata records...`)
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no deletions)' : 'LIVE (will delete)'}\n`)

  // Get all angled_shots with Google Drive files
  const { data: angledShots, error: fetchError } = await supabase
    .from('angled_shots')
    .select('id, gdrive_file_id, angle_name, storage_provider')
    .eq('storage_provider', 'gdrive')
    .not('gdrive_file_id', 'is', null)

  if (fetchError) {
    console.error('❌ Error fetching angled shots:', fetchError)
    process.exit(1)
  }

  if (!angledShots || angledShots.length === 0) {
    console.log('✅ No Google Drive records found to check')
    return
  }

  console.log(`Found ${angledShots.length} Google Drive records to verify\n`)

  const orphanedRecords: typeof angledShots = []
  let checkedCount = 0

  // Check each file
  for (const shot of angledShots) {
    checkedCount++
    process.stdout.write(`\r   Checking ${checkedCount}/${angledShots.length}...`)

    try {
      const response = await drive.files.get({
        fileId: shot.gdrive_file_id!,
        fields: 'id, trashed',
        supportsAllDrives: true,
      })

      // If file is trashed, mark as orphaned
      if (response.data.trashed) {
        orphanedRecords.push(shot)
        console.log(`\n   ❌ Trashed: ${shot.angle_name} (${shot.id})`)
      }
    } catch (error: any) {
      // File not found or other errors - mark as orphaned
      if (error.code === 404 || error.status === 404) {
        orphanedRecords.push(shot)
        console.log(`\n   ❌ Not found: ${shot.angle_name} (${shot.id})`)
      } else {
        console.error(`\n   ⚠️  Error checking ${shot.gdrive_file_id}:`, error.message)
      }
    }
  }

  console.log(`\n\n📊 Results:`)
  console.log(`   Total records checked: ${angledShots.length}`)
  console.log(`   ✅ Valid records: ${angledShots.length - orphanedRecords.length}`)
  console.log(`   ❌ Orphaned records: ${orphanedRecords.length}`)

  if (orphanedRecords.length === 0) {
    console.log(`\n🎉 No orphaned records found! Database is clean.`)
    return
  }

  if (dryRun) {
    console.log(`\n⚠️  DRY RUN MODE - No deletions performed`)
    console.log(`\nOrphaned records that would be deleted:`)
    orphanedRecords.forEach(record => {
      console.log(`   - ${record.angle_name} (${record.id})`)
    })
    console.log(`\nTo actually delete these records, run with --execute flag`)
  } else {
    console.log(`\n🗑️  Deleting ${orphanedRecords.length} orphaned records...`)

    const idsToDelete = orphanedRecords.map(r => r.id)
    const { error: deleteError } = await supabase
      .from('angled_shots')
      .delete()
      .in('id', idsToDelete)

    if (deleteError) {
      console.error('❌ Error deleting orphaned records:', deleteError)
      process.exit(1)
    }

    console.log(`✅ Successfully deleted ${orphanedRecords.length} orphaned records`)
    console.log(`\n🎉 Database cleanup complete!`)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = !args.includes('--execute')

if (dryRun) {
  console.log('⚠️  Running in DRY RUN mode. Use --execute to actually delete records.\n')
}

cleanupOrphanedMetadata(dryRun)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
