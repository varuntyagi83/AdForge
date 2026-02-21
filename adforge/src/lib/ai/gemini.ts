import { GoogleGenerativeAI } from '@google/generative-ai'
import { VertexAI } from '@google-cloud/vertexai'

// Lazy initialization of Gemini AI client
let genAI: GoogleGenerativeAI | null = null
let vertexAI: VertexAI | null = null

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || ''
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set')
    }
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

function getVertexAI(): VertexAI {
  if (!vertexAI) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || ''
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'

    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is not set')
    }

    vertexAI = new VertexAI({
      project: projectId,
      location: location,
    })
  }
  return vertexAI
}

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
    const model = getGenAI().getGenerativeModel({ model: 'gemini-3-pro-image-preview' })

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
 * Generates angled shot variations using Vertex AI Imagen 4
 *
 * Uses Google's latest Imagen 4 model for superior image quality and text preservation
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

    // Step 2: Initialize Vertex AI Imagen 4 model
    const vertex = getVertexAI()
    const generativeModel = vertex.preview.getGenerativeModel({
      model: 'imagen-4.0-generate-001', // Latest Imagen 4 for best quality and text preservation
    })

    // Step 3: Convert base64 image to proper format
    const base64Data = productImageData.replace(/^data:image\/\w+;base64,/, '')

    // Step 4: Generate each angle variation
    const results = []

    for (const angle of angles) {
      console.log(`Generating ${angle.name} angle...`)

      // Generate detailed prompt for this angle
      const prompt = await generateAnglePrompt(
        productDescription,
        angle,
        lookAndFeel
      )

      try {
        // Generate image using Vertex AI Imagen 4
        const request = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt,
                },
                {
                  inlineData: {
                    mimeType: productImageMimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4, // Lower temperature for more consistent product representation
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }

        const response = await generativeModel.generateContent(request)
        const generatedImage = response.response.candidates?.[0]?.content?.parts?.[0]

        if (generatedImage && 'inlineData' in generatedImage) {
          // Successfully generated image
          const generatedBase64 = generatedImage.inlineData.data
          const generatedMimeType = generatedImage.inlineData.mimeType || 'image/jpeg'

          results.push({
            angleName: angle.name,
            angleDescription: angle.description,
            promptUsed: prompt,
            imageData: `data:${generatedMimeType};base64,${generatedBase64}`,
            mimeType: generatedMimeType,
          })

          console.log(`   ✅ ${angle.name} generated successfully`)
        } else {
          console.warn(`   ⚠️  Failed to generate ${angle.name}, using original image as fallback`)
          // Fallback to original image if generation fails
          results.push({
            angleName: angle.name,
            angleDescription: angle.description,
            promptUsed: prompt,
            imageData: productImageData,
            mimeType: productImageMimeType,
          })
        }
      } catch (error) {
        console.error(`   ❌ Error generating ${angle.name}:`, error)
        // Fallback to original image on error
        results.push({
          angleName: angle.name,
          angleDescription: angle.description,
          promptUsed: prompt,
          imageData: productImageData,
          mimeType: productImageMimeType,
        })
      }
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
