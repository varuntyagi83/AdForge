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
 * GET /api/categories/[id]/templates
 * Lists all templates for a category
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

    // Get all templates for this category
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      templates: templates || [],
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories/[id]/templates
 * Creates a new template with template_data JSON
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id: categoryId } = await params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: category } = await supabase
      .from('categories')
      .select('id, slug')
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      description,
      template_data,
      format = '1:1',
      width = 1080,
      height = 1080,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    if (!template_data) {
      return NextResponse.json(
        { error: 'template_data is required' },
        { status: 400 }
      )
    }

    const slug = generateSlug(name)

    // Save template preview as JSON to Google Drive
    // (This is just the template configuration, not an actual rendered image)
    const templatePreview = {
      name,
      description,
      format,
      width,
      height,
      template_data,
      created_at: new Date().toISOString(),
    }

    const fileName = `${category.slug}/templates/${slug}_${Date.now()}.json`
    const buffer = Buffer.from(JSON.stringify(templatePreview, null, 2), 'utf-8')

    console.log(`Uploading template preview to Google Drive: ${fileName}`)
    const storageFile = await uploadFile(buffer, fileName, {
      contentType: 'application/json',
      provider: 'gdrive',
    })

    // Save to database
    const { data: template, error: dbError } = await supabase
      .from('templates')
      .insert({
        category_id: categoryId,
        user_id: user.id,
        name,
        description: description || null,
        format,
        width,
        height,
        template_data,
        storage_provider: 'gdrive',
        storage_path: storageFile.path,
        storage_url: storageFile.publicUrl,
        gdrive_file_id: storageFile.fileId || null,
        slug,
        metadata: {},
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save template' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Template created successfully', template },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
