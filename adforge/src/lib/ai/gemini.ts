import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

// Predefined angle variations for product photography
export const ANGLE_VARIATIONS = [
  {
    name: 'front',
    description: 'Front view, straight on',
    prompt: 'product facing directly forward, centered, neutral angle',
  },
  {
    name: 'left_30deg',
    description: 'Left side, 30 degree angle',
    prompt: 'product rotated 30 degrees to the left, showing left side perspective',
  },
  {
    name: 'right_30deg',
    description: 'Right side, 30 degree angle',
    prompt: 'product rotated 30 degrees to the right, showing right side perspective',
  },
  {
    name: 'top_45deg',
    description: 'Top view, 45 degree angle',
    prompt: 'product viewed from above at 45 degree angle, showing top surface',
  },
  {
    name: 'three_quarter_left',
    description: 'Three-quarter view from left',
    prompt: 'product at three-quarter angle from the left, showing front and left side',
  },
  {
    name: 'three_quarter_right',
    description: 'Three-quarter view from right',
    prompt: 'product at three-quarter angle from the right, showing front and right side',
  },
  {
    name: 'isometric',
    description: 'Isometric view',
    prompt: 'product in isometric perspective, showing three sides simultaneously',
  },
]

/**
 * Analyzes a product image to understand its features and context
 */
export async function analyzeProductImage(
  imageData: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Convert base64 to proper format if needed
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
      {
        text: `Analyze this product image in detail. Describe:
1. What is the product?
2. What are its key visual features (colors, textures, materials)?
3. What is the current viewing angle?
4. What background or setting is it in?
5. What is the product's shape and form?

Provide a concise but detailed description that would help recreate this product from different angles.`,
      },
    ])

    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error analyzing product image:', error)
    throw new Error('Failed to analyze product image')
  }
}

/**
 * Generates a detailed prompt for creating an angled variation of a product
 */
export async function generateAnglePrompt(
  productDescription: string,
  angleVariation: (typeof ANGLE_VARIATIONS)[number],
  lookAndFeel?: string
): Promise<string> {
  const basePrompt = `Product photography: ${angleVariation.prompt}.

Product description: ${productDescription}

${lookAndFeel ? `Style and aesthetic: ${lookAndFeel}\n` : ''}
Requirements:
- Professional product photography lighting
- Clean, neutral background or subtle gradient
- High resolution and sharp focus
- Maintain product colors and materials accurately
- ${angleVariation.description}
- No text or watermarks
- Commercial quality`

  return basePrompt
}

/**
 * Generates angled shot variations using Gemini image generation
 *
 * Note: This uses Gemini's Imagen 3 integration via the Generative AI API.
 * For production, you may need to use Vertex AI's Imagen API directly.
 */
export async function generateAngledShots(
  productImageData: string,
  productImageMimeType: string,
  angles: (typeof ANGLE_VARIATIONS)[number][],
  lookAndFeel?: string
): Promise<
  Array<{
    angleName: string
    angleDescription: string
    promptUsed: string
    imageData: string
    mimeType: string
  }>
> {
  try {
    // Step 1: Analyze the original product image
    console.log('Analyzing product image...')
    const productDescription = await analyzeProductImage(
      productImageData,
      productImageMimeType
    )

    // Step 2: Generate each angle variation
    const results = []

    for (const angle of angles) {
      console.log(`Generating ${angle.name} angle...`)

      // Generate detailed prompt for this angle
      const prompt = await generateAnglePrompt(
        productDescription,
        angle,
        lookAndFeel
      )

      // For now, we'll use Gemini's text generation to create enhanced prompts
      // In production, you would use Vertex AI's Imagen API for actual image generation
      // or integrate with another image generation service

      // Placeholder: Return the analysis and prompt
      // In Phase 2 full implementation, this will call Imagen API
      results.push({
        angleName: angle.name,
        angleDescription: angle.description,
        promptUsed: prompt,
        imageData: productImageData, // Placeholder - will be replaced with generated image
        mimeType: productImageMimeType,
      })
    }

    return results
  } catch (error) {
    console.error('Error generating angled shots:', error)
    throw new Error('Failed to generate angled shots')
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function generateImage(
  prompt: string,
  referenceImages?: { data: string; mimeType: string; role: string }[]
): Promise<{ images: { data: string; mimeType: string }[]; text: string }> {
  // Use the reference image if provided
  if (referenceImages && referenceImages.length > 0) {
    const refImage = referenceImages[0]
    const analysis = await analyzeProductImage(refImage.data, refImage.mimeType)

    return {
      images: [
        {
          data: refImage.data, // Placeholder
          mimeType: refImage.mimeType,
        },
      ],
      text: analysis,
    }
  }

  throw new Error('Image generation requires reference images')
}
