import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { uploadFile } from '@/lib/storage'

/**
 * GET /api/categories/[id]/templates/[templateId]
 * Fetches a single template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id: categoryId, templateId } = await params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify category ownership
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Fetch template
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .eq('category_id', categoryId)
      .single()

    if (error || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/categories/[id]/templates/[templateId]
 * Updates a template (template_data, name, description)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id: categoryId, templateId } = await params

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

    // Get existing template
    const { data: existingTemplate } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .eq('category_id', categoryId)
      .single()

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, template_data } = body

    // Build update object
    const updates: any = {}

    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (template_data !== undefined) updates.template_data = template_data

    // Update storage file if template_data changed
    if (template_data !== undefined) {
      const templatePreview = {
        name: name || existingTemplate.name,
        description: description || existingTemplate.description,
        format: existingTemplate.format,
        width: existingTemplate.width,
        height: existingTemplate.height,
        template_data,
        updated_at: new Date().toISOString(),
      }

      const fileName = existingTemplate.storage_path
      const buffer = Buffer.from(
        JSON.stringify(templatePreview, null, 2),
        'utf-8'
      )

      console.log(`Updating template preview in Google Drive: ${fileName}`)
      const storageFile = await uploadFile(buffer, fileName, {
        contentType: 'application/json',
        provider: 'gdrive',
      })

      updates.storage_url = storageFile.publicUrl
      updates.gdrive_file_id = storageFile.fileId || null
    }

    // Update database
    const { data: template, error: dbError } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', templateId)
      .eq('category_id', categoryId)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to update template' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Template updated successfully',
      template,
    })
  } catch (error: any) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/categories/[id]/templates/[templateId]
 * Deletes a template (trigger will queue Google Drive deletion)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id: categoryId, templateId } = await params

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership via category
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Delete (trigger will queue Google Drive deletion)
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId)
      .eq('category_id', categoryId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
