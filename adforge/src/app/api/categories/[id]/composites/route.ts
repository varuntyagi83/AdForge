import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { uploadFile } from '@/lib/storage'

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * GET /api/categories/[id]/composites
 * Lists all composites for a category with angled shot and background details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id: categoryId } = await params

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify category belongs to user
    const { data: category } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get all composites with related angled shots and backgrounds
    const { data: composites, error } = await supabase
      .from('composites')
      .select(`
        *,
        angled_shot:angled_shot_id (
          id,
          angle_name,
          angle_description
        ),
        background:background_id (
          id,
          name,
          description
        )
      `)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching composites:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URLs for the images
    const compositesWithUrls = (composites || []).map((composite) => {
      let publicUrl: string

      // Use Google Drive URL if stored in Google Drive
      if (composite.storage_provider === 'gdrive' && composite.storage_url) {
        publicUrl = composite.storage_url
      } else {
        // Fallback to Supabase Storage URL
        publicUrl = composite.storage_url || ''
      }

      return {
        ...composite,
        public_url: publicUrl,
      }
    })

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      composites: compositesWithUrls,
    })
  } catch (error) {
    console.error('Error fetching composites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories/[id]/composites
 * Saves a generated composite to Google Drive and database
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id: categoryId } = await params

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify category belongs to user and get slug
    const { data: category } = await supabase
      .from('categories')
      .select('id, slug')
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get request body
    const body = await request.json()
    const {
      name,
      description,
      promptUsed,
      imageData,
      mimeType,
      angledShotId,
      backgroundId,
      productId,
    } = body

    // Validate required fields
    if (!name || !imageData || !angledShotId || !backgroundId) {
      return NextResponse.json(
        { error: 'name, imageData, angledShotId, and backgroundId are required' },
        { status: 400 }
      )
    }

    // Verify angled shot exists and belongs to this category
    const { data: angledShot } = await supabase
      .from('angled_shots')
      .select('id, product_id')
      .eq('id', angledShotId)
      .eq('category_id', categoryId)
      .single()

    if (!angledShot) {
      return NextResponse.json(
        { error: 'Angled shot not found in this category' },
        { status: 404 }
      )
    }

    // Verify background exists and belongs to this category
    const { data: background } = await supabase
      .from('backgrounds')
      .select('id')
      .eq('id', backgroundId)
      .eq('category_id', categoryId)
      .single()

    if (!background) {
      return NextResponse.json(
        { error: 'Background not found in this category' },
        { status: 404 }
      )
    }

    // Generate slug
    const slug = generateSlug(name)

    // Check if composite with this slug already exists
    const { data: existing } = await supabase
      .from('composites')
      .select('id')
      .eq('category_id', categoryId)
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A composite with this name already exists in this category' },
        { status: 409 }
      )
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate filename using human-readable folder names (slugs)
    const fileExt = mimeType?.split('/')[1] || 'jpg'
    const fileName = `${category.slug}/composites/${slug}_${Date.now()}.${fileExt}`

    // Upload to Google Drive
    console.log(`Uploading composite to Google Drive: ${fileName}`)
    const storageFile = await uploadFile(buffer, fileName, {
      contentType: mimeType || 'image/jpeg',
      provider: 'gdrive',
    })

    // Save to database with storage sync fields
    const { data: composite, error: dbError } = await supabase
      .from('composites')
      .insert({
        category_id: categoryId,
        user_id: user.id,
        product_id: productId || angledShot.product_id,
        angled_shot_id: angledShotId,
        background_id: backgroundId,
        name,
        slug,
        description: description || null,
        prompt_used: promptUsed || null,
        storage_provider: 'gdrive',
        storage_path: storageFile.path,
        storage_url: storageFile.publicUrl,
        gdrive_file_id: storageFile.fileId || null,
        metadata: {},
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save composite record' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Composite saved successfully',
        composite: {
          ...composite,
          public_url: storageFile.publicUrl,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving composite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
