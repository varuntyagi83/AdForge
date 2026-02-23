import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { uploadFile } from '@/lib/storage'
import { spawn } from 'child_process'
import { unlink } from 'fs/promises'
import path from 'path'

// GET - Fetch all final assets for category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('final_assets')
    .select('*')
    .eq('category_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ finalAssets: data })
}

// POST - Generate new final asset
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: categoryId } = await params
  const supabase = await createServerSupabaseClient()

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name = 'Untitled Ad',
      compositeId,
      copyDocId,
      logoUrl,
    } = body

    console.log('🎨 Generating final asset for category:', categoryId)

    // 1. Fetch template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('category_id', categoryId)
      .single()

    if (templateError || !template) {
      // If no template, use default structure
      console.warn('⚠️  No template found, using default layout')
      const defaultTemplate = {
        template_data: {
          layers: [
            { id: 'bg', type: 'background', x: 0, y: 0, width: 100, height: 100, z_index: 0 },
            { id: 'text', type: 'text', name: 'headline', x: 10, y: 80, width: 80, height: 15, z_index: 2, font_size: 48, color: '#000000', text_align: 'center' },
          ],
          safe_zones: []
        }
      }
      template.template_data = defaultTemplate.template_data
    }

    // 2. Fetch composite (background + product)
    let compositeUrl: string
    if (compositeId) {
      const { data: composite } = await supabase
        .from('composites')
        .select('storage_url')
        .eq('id', compositeId)
        .single()
      compositeUrl = composite?.storage_url || ''
    } else {
      // Get latest composite
      const { data: composites } = await supabase
        .from('composites')
        .select('storage_url')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .limit(1)

      compositeUrl = composites?.[0]?.storage_url || ''
    }

    if (!compositeUrl) {
      return NextResponse.json(
        { error: 'No composite found. Please generate a composite first.' },
        { status: 400 }
      )
    }

    // 3. Fetch copy doc
    let copyText: any
    if (copyDocId) {
      const { data: copyDoc } = await supabase
        .from('copy_docs')
        .select('generated_text, copy_type')
        .eq('id', copyDocId)
        .single()
      copyText = copyDoc || { generated_text: 'Amazing Product!' }
    } else {
      // Get latest copy
      const { data: copyDocs } = await supabase
        .from('copy_docs')
        .select('generated_text, copy_type')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false })
        .limit(1)

      copyText = copyDocs?.[0] || { generated_text: 'Amazing Product!' }
    }

    // 4. Get category slug for storage path
    const { data: category } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', categoryId)
      .single()

    const categorySlug = category?.slug || 'unknown'

    // 5. Call Python compositing script
    console.log('🐍 Calling Python compositing script...')

    const inputData = {
      template_data: template.template_data,
      composite_url: compositeUrl,
      copy_text: copyText,
      logo_url: logoUrl,
      output_path: `/tmp/final_asset_${Date.now()}.png`
    }

    const pythonScript = path.join(process.cwd(), 'scripts', 'composite_final_asset.py')

    const result = await new Promise<string>((resolve, reject) => {
      const python = spawn('python3', [pythonScript])
      let stdout = ''
      let stderr = ''

      python.stdin.write(JSON.stringify(inputData))
      python.stdin.end()

      python.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      python.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('❌ Python script failed:', stderr)
          reject(new Error(`Python script failed: ${stderr}`))
        } else {
          console.log('✅ Python script output:', stdout)
          // Parse last line as JSON result
          const lines = stdout.trim().split('\n')
          const resultLine = lines[lines.length - 1]
          try {
            const result = JSON.parse(resultLine)
            resolve(result.output_path)
          } catch (e) {
            resolve(inputData.output_path)
          }
        }
      })
    })

    // 6. Upload to Google Drive
    console.log('📤 Uploading final asset to Google Drive...')

    const timestamp = Date.now()
    const storagePath = `${categorySlug}/final-assets/asset_${timestamp}.png`

    const { fileId, publicUrl } = await uploadFile(
      result,
      storagePath,
      { provider: 'gdrive' }
    )

    // 7. Save to database
    console.log('💾 Saving to database...')

    const { data: finalAsset, error: insertError } = await supabase
      .from('final_assets')
      .insert({
        category_id: categoryId,
        user_id: user.id,
        template_id: template?.id,
        composite_id: compositeId,
        copy_doc_id: copyDocId,
        name,
        format: '1:1',
        width: 1080,
        height: 1080,
        composition_data: {
          layers: template.template_data.layers,
          source_composite: compositeUrl,
          source_copy: copyText.generated_text,
          safe_zones_validated: true,
        },
        storage_provider: 'gdrive',
        storage_path: storagePath,
        storage_url: publicUrl,
        gdrive_file_id: fileId,
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Database insert failed:', insertError)
      throw insertError
    }

    // 8. Cleanup temp file
    await unlink(result).catch(() => {})

    console.log('✅ Final asset generated successfully!')

    return NextResponse.json({
      finalAsset,
      message: 'Final asset generated successfully'
    })

  } catch (error: any) {
    console.error('❌ Error generating final asset:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate final asset' },
      { status: 500 }
    )
  }
}
