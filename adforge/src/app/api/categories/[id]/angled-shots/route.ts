import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * GET /api/categories/[id]/angled-shots
 * Lists all angled shots for a category
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
      .select('id, name')
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')

    // Build query
    let query = supabase
      .from('angled_shots')
      .select(
        `
        id,
        angle_name,
        angle_description,
        prompt_used,
        storage_path,
        storage_url,
        created_at,
        product:products!inner(id, name, slug),
        product_image:product_images!inner(id, file_name)
      `
      )
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })

    // Filter by product if specified
    if (productId) {
      query = query.eq('product_id', productId)
    }

    const { data: angledShots, error } = await query

    if (error) {
      console.error('Error fetching angled shots:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URLs for the images
    const angledShotsWithUrls = await Promise.all(
      (angledShots || []).map(async (shot) => {
        const {
          data: { publicUrl },
        } = supabase.storage.from('angled-shots').getPublicUrl(shot.storage_path)

        return {
          ...shot,
          public_url: publicUrl,
        }
      })
    )

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
      },
      angledShots: angledShotsWithUrls,
    })
  } catch (error) {
    console.error('Error fetching angled shots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories/[id]/angled-shots
 * Saves a generated angled shot to storage and database
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

    // Verify category belongs to user
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get request body
    const body = await request.json()
    const {
      productId,
      productImageId,
      angleName,
      angleDescription,
      promptUsed,
      imageData,
      mimeType,
    } = body

    // Validate required fields
    if (
      !productId ||
      !productImageId ||
      !angleName ||
      !angleDescription ||
      !imageData
    ) {
      return NextResponse.json(
        {
          error:
            'productId, productImageId, angleName, angleDescription, and imageData are required',
        },
        { status: 400 }
      )
    }

    // Verify product belongs to this category
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .eq('category_id', categoryId)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate filename
    const fileExt = mimeType?.split('/')[1] || 'jpg'
    const fileName = `${user.id}/${categoryId}/${productId}/${angleName}_${Date.now()}.${fileExt}`

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('angled-shots')
      .upload(fileName, buffer, {
        contentType: mimeType || 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload angled shot' },
        { status: 500 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('angled-shots').getPublicUrl(fileName)

    // Save to database
    const { data: angledShot, error: dbError } = await supabase
      .from('angled_shots')
      .insert({
        product_id: productId,
        product_image_id: productImageId,
        category_id: categoryId,
        user_id: user.id,
        angle_name: angleName,
        angle_description: angleDescription,
        prompt_used: promptUsed || null,
        storage_path: fileName,
        storage_url: publicUrl,
        metadata: {},
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Try to delete the uploaded file
      await supabase.storage.from('angled-shots').remove([fileName])
      return NextResponse.json(
        { error: 'Failed to save angled shot record' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Angled shot saved successfully',
        angledShot: {
          ...angledShot,
          public_url: publicUrl,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving angled shot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
