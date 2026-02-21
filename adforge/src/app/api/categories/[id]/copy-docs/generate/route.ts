import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateCopyVariations } from '@/lib/ai/openai'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id: categoryId } = await params

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify category ownership
    const { data: category } = await supabase
      .from('categories')
      .select('id, name, slug, look_and_feel')
      .eq('id', categoryId)
      .eq('user_id', user.id)
      .single()

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const {
      brief,
      copyType = 'hook',
      count = 1,
      tone,
      targetAudience,
    } = body

    // Validation
    if (!brief || brief.trim().length === 0) {
      return NextResponse.json({ error: 'brief is required' }, { status: 400 })
    }

    if (count < 1 || count > 5) {
      return NextResponse.json(
        { error: 'count must be between 1 and 5' },
        { status: 400 }
      )
    }

    const validCopyTypes = ['hook', 'cta', 'body', 'tagline', 'headline']
    if (!validCopyTypes.includes(copyType)) {
      return NextResponse.json(
        { error: `copyType must be one of: ${validCopyTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate copy variations
    console.log(
      `Generating ${count} ${copyType} variations for category: ${category.slug}`
    )

    const results = await generateCopyVariations(
      brief,
      copyType,
      category.look_and_feel || '',
      count,
      tone,
      targetAudience
    )

    return NextResponse.json({
      message: `Generated ${results.length} copy variations`,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      results: results.map((r) => ({
        prompt_used: r.promptUsed,
        generated_text: r.generatedText,
      })),
    })
  } catch (error: any) {
    console.error('Error generating copy:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
