import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/references/search?q=query - Search brand assets and products
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Search brand assets
    const { data: brandAssets } = await supabase
      .from('brand_assets')
      .select('id, file_name, file_path, mime_type')
      .eq('user_id', user.id)
      .ilike('file_name', `%${query}%`)
      .limit(5)

    // Search products across all categories
    const { data: products } = await supabase
      .from('products')
      .select('id, name, slug, category:categories!inner(id, name, user_id)')
      .eq('category.user_id', user.id)
      .ilike('name', `%${query}%`)
      .limit(5)

    // Format results
    const brandAssetResults = (brandAssets || []).map((asset) => ({
      id: asset.id,
      type: 'brand-asset' as const,
      name: asset.file_name,
      preview: supabase.storage.from('brand-assets').getPublicUrl(asset.file_path).data
        .publicUrl,
      isImage: asset.mime_type.startsWith('image/'),
    }))

    const productResults = (products || []).map((product: any) => ({
      id: product.id,
      type: 'product' as const,
      name: product.name,
      categoryName: product.category.name,
      categoryId: product.category.id,
    }))

    const results = [...brandAssetResults, ...productResults]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
