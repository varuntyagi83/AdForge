import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { google } from 'googleapis'

/**
 * Admin endpoint to cleanup orphaned metadata
 * Removes Supabase records where Google Drive files are trashed or missing
 *
 * Usage:
 * POST /api/admin/cleanup-orphaned-metadata
 * Body: { dryRun: true } (optional, defaults to true)
 * Headers: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const dryRun = body.dryRun !== false // Default to true

    const supabase = await createServerSupabaseClient()

    // Initialize Google Drive
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    })

    const drive = google.drive({ version: 'v3', auth })

    // Get all angled_shots with Google Drive files
    const { data: angledShots, error: fetchError } = await supabase
      .from('angled_shots')
      .select('id, gdrive_file_id, angle_name, storage_provider')
      .eq('storage_provider', 'gdrive')
      .not('gdrive_file_id', 'is', null)

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch records', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!angledShots || angledShots.length === 0) {
      return NextResponse.json({
        message: 'No Google Drive records to check',
        stats: { total: 0, orphaned: 0, deleted: 0 },
      })
    }

    const orphanedRecords: typeof angledShots = []

    // Check each file
    for (const shot of angledShots) {
      try {
        const response = await drive.files.get({
          fileId: shot.gdrive_file_id!,
          fields: 'id, trashed',
          supportsAllDrives: true,
        })

        // If file is trashed, mark as orphaned
        if (response.data.trashed) {
          orphanedRecords.push(shot)
        }
      } catch (error: any) {
        // File not found (404) or other errors - mark as orphaned
        if (error.code === 404 || error.status === 404) {
          orphanedRecords.push(shot)
        } else {
          console.error(`Error checking file ${shot.gdrive_file_id}:`, error.message)
          // For other errors, also mark as orphaned to be safe
          orphanedRecords.push(shot)
        }
      }
    }

    const stats = {
      total: angledShots.length,
      valid: angledShots.length - orphanedRecords.length,
      orphaned: orphanedRecords.length,
      deleted: 0,
    }

    // Delete orphaned records if not dry run
    if (!dryRun && orphanedRecords.length > 0) {
      const idsToDelete = orphanedRecords.map(r => r.id)

      const { error: deleteError } = await supabase
        .from('angled_shots')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) {
        return NextResponse.json(
          {
            error: 'Failed to delete orphaned records',
            details: deleteError.message,
            stats
          },
          { status: 500 }
        )
      }

      stats.deleted = orphanedRecords.length
    }

    return NextResponse.json({
      message: dryRun
        ? `Dry run complete - ${orphanedRecords.length} records would be deleted`
        : `Cleanup complete - ${stats.deleted} records deleted`,
      dryRun,
      stats,
      orphanedRecords: orphanedRecords.map(r => ({
        id: r.id,
        angle_name: r.angle_name,
        gdrive_file_id: r.gdrive_file_id,
      })),
    })
  } catch (error: any) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
