#!/usr/bin/env tsx
/**
 * Fix Google Drive URLs to use thumbnail API instead of download URLs
 * Changes: export=download → thumbnail API for proper image display
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function fixGDriveUrls() {
  console.log('🔧 Fixing Google Drive URLs...\n')

  // Get all angled_shots with old download URLs
  const { data: angledShots, error: fetchError } = await supabase
    .from('angled_shots')
    .select('id, storage_url, gdrive_file_id')
    .like('storage_url', '%export=download%')

  if (fetchError) {
    console.error('❌ Error fetching angled shots:', fetchError)
    process.exit(1)
  }

  if (!angledShots || angledShots.length === 0) {
    console.log('✅ No URLs to fix - all are already using thumbnail API')
    return
  }

  console.log(`Found ${angledShots.length} URLs to fix\n`)

  let successCount = 0
  let failCount = 0

  for (const shot of angledShots) {
    try {
      // Extract file ID from old URL or use gdrive_file_id
      let fileId = shot.gdrive_file_id

      if (!fileId && shot.storage_url) {
        const match = shot.storage_url.match(/[?&]id=([^&]+)/)
        fileId = match ? match[1] : null
      }

      if (!fileId) {
        console.log(`   ⚠️  ${shot.id}: No file ID found, skipping`)
        failCount++
        continue
      }

      // Generate new thumbnail URL
      const newUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`

      // Update in database
      const { error: updateError } = await supabase
        .from('angled_shots')
        .update({ storage_url: newUrl })
        .eq('id', shot.id)

      if (updateError) {
        console.error(`   ❌ ${shot.id}: ${updateError.message}`)
        failCount++
      } else {
        console.log(`   ✅ ${shot.id}: Updated to thumbnail URL`)
        successCount++
      }
    } catch (error) {
      console.error(`   ❌ ${shot.id}: ${error}`)
      failCount++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Updated: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📦 Total: ${angledShots.length}`)

  if (successCount > 0) {
    console.log(`\n🎉 URLs fixed! Images should now display properly in the UI.`)
  }
}

fixGDriveUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
