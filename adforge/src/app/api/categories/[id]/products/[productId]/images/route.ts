import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/categories/[id]/products/[productId]/images - List product images
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id: categoryId, productId } = await params

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify product belongs to user's category
    const { data: product } = await supabase
      .from('products')
      .select('*, category:categories!inner(user_id)')
      .eq('id', productId)
      .eq('category_id', categoryId)
      .eq('category.user_id', user.id)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get all images for this product
    const { data: images, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ images })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/categories/[id]/products/[productId]/images - Upload product images
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id: categoryId, productId } = await params

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify product belongs to user's category
    const { data: product } = await supabase
      .from('products')
      .select('*, category:categories!inner(user_id)')
      .eq('id', productId)
      .eq('category_id', categoryId)
      .eq('category.user_id', user.id)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Check if this is the first image (will be primary)
    const { count: existingCount } = await supabase
      .from('product_images')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    const isFirstImage = existingCount === 0

    const uploadedImages = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${productId}/${Date.now()}-${i}.${fileExt}`

      // Upload to Supabase Storage
      const { data: storageData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(fileName)

      // Save to database
      const { data: imageRecord, error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          is_primary: isFirstImage && i === 0, // First image of first upload is primary
        })
        .select()
        .single()

      if (!dbError && imageRecord) {
        uploadedImages.push({
          ...imageRecord,
          public_url: publicUrl,
        })
      }
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { error: 'Failed to upload images' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: `Successfully uploaded ${uploadedImages.length} image(s)`,
        images: uploadedImages,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
