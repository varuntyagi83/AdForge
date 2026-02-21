import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateAngledShots } from '@/lib/ai/gemini'
import { ANGLE_VARIATIONS } from '@/lib/ai/angle-variations'

/**
 * POST /api/categories/[id]/angled-shots/generate
 * Generates angled shot variations from a product image using AI
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
      .select('id, name, look_and_feel')
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get request body
    const body = await request.json()
    const { productId, productImageId, selectedAngles } = body

    if (!productId || !productImageId) {
      return NextResponse.json(
        { error: 'productId and productImageId are required' },
        { status: 400 }
      )
    }

    // Verify product belongs to this category
    const { data: product } = await supabase
      .from('products')
      .select('id, name, category_id')
      .eq('id', productId)
      .eq('category_id', categoryId)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get the product image from database and storage
    const { data: productImage } = await supabase
      .from('product_images')
      .select('id, file_path, file_name, mime_type')
      .eq('id', productImageId)
      .eq('product_id', productId)
      .single()

    if (!productImage) {
      return NextResponse.json(
        { error: 'Product image not found' },
        { status: 404 }
      )
    }

    // Download the image from storage
    const { data: imageBlob, error: downloadError } = await supabase.storage
      .from('product-images')
      .download(productImage.file_path)

    if (downloadError || !imageBlob) {
      console.error('Error downloading image:', downloadError)
      return NextResponse.json(
        { error: 'Failed to download product image' },
        { status: 500 }
      )
    }

    // Convert blob to base64
    const arrayBuffer = await imageBlob.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')
    const imageData = `data:${productImage.mime_type};base64,${base64Image}`

    // Determine which angles to generate
    const anglesToGenerate = selectedAngles
      ? ANGLE_VARIATIONS.filter((angle) =>
          selectedAngles.includes(angle.name)
        )
      : ANGLE_VARIATIONS

    if (anglesToGenerate.length === 0) {
      return NextResponse.json(
        { error: 'No valid angles selected' },
        { status: 400 }
      )
    }

    // Generate angled shots using Gemini AI
    console.log(
      `Generating ${anglesToGenerate.length} angled shots for product ${product.name}...`
    )

    const generatedShots = await generateAngledShots(
      base64Image,
      productImage.mime_type,
      anglesToGenerate,
      category.look_and_feel || undefined
    )

    return NextResponse.json({
      message: `Generated ${generatedShots.length} angled shot variations`,
      category: {
        id: category.id,
        name: category.name,
      },
      product: {
        id: product.id,
        name: product.name,
      },
      sourceImage: {
        id: productImage.id,
        fileName: productImage.file_name,
      },
      generatedShots: generatedShots.map((shot) => ({
        angleName: shot.angleName,
        angleDescription: shot.angleDescription,
        promptUsed: shot.promptUsed,
        // Note: imageData is included for preview but not saved yet
        preview: shot.imageData.substring(0, 100) + '...', // Truncate for response
      })),
      // Full data for client-side preview/saving
      previewData: generatedShots,
    })
  } catch (error) {
    console.error('Error generating angled shots:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate angled shots',
      },
      { status: 500 }
    )
  }
}
