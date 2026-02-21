import { GoogleGenerativeAI } from '@google/generative-ai'
import { ANGLE_VARIATIONS } from './angle-variations'

// Lazy initialization of Gemini AI client
let genAI: GoogleGenerativeAI | null = null

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
 * Generates angled shot variations using Gemini 3 Pro Image Preview
 *
 * Uses Gemini's image-to-image generation for better product preservation
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
    // Initialize Gemini model with image generation support
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
      generationConfig: {
        temperature: 0.4, // Lower temperature for consistent product representation
        topP: 0.95,
        maxOutputTokens: 32768,
        responseModalities: ['TEXT', 'IMAGE'], // Type not yet in SDK, but supported by API
      } as any,
    })

    // Convert base64 image to proper format
    const base64Data = productImageData.replace(/^data:image\/\w+;base64,/, '')

    // Generate each angle variation
    const results = []

    for (const angle of angles) {
      console.log(`Generating ${angle.name} angle...`)

      // Create prompt for this specific angle
      const prompt = `Create a variation of this product image showing: ${angle.description}.

Angle instruction: ${angle.prompt}

${lookAndFeel ? `Style: ${lookAndFeel}\n` : ''}
CRITICAL REQUIREMENTS:
- Preserve ALL text on the product exactly as shown
- Maintain the same product colors, materials, and design
- Keep the same background style
- Only change the viewing angle to show: ${angle.description}
- High quality, professional product photography
- Do not add or remove any elements

Return a high-quality image with the product rotated to the specified angle while preserving all details.`

      try {
        const result = await model.generateContent([
          {
            inlineData: {
              data: base64Data,
              mimeType: productImageMimeType,
            },
          },
          {
            text: prompt,
          },
        ])

        const response = await result.response

        // Extract the generated image from the response
        const candidates = response.candidates
        if (candidates && candidates.length > 0) {
          const parts = candidates[0].content.parts

          // Find the image part
          const imagePart = parts?.find((part: any) => part.inlineData)

          if (imagePart && 'inlineData' in imagePart && imagePart.inlineData?.data) {
            const generatedBase64 = imagePart.inlineData.data
            const generatedMimeType = imagePart.inlineData.mimeType || 'image/jpeg'

            results.push({
              angleName: angle.name,
              angleDescription: angle.description,
              promptUsed: prompt,
              imageData: `data:${generatedMimeType};base64,${generatedBase64}`,
              mimeType: generatedMimeType,
            })

            console.log(`   ✅ ${angle.name} generated successfully`)
          } else {
            console.warn(`   ⚠️  No image in response for ${angle.name}, using original as fallback`)
            results.push({
              angleName: angle.name,
              angleDescription: angle.description,
              promptUsed: prompt,
              imageData: productImageData,
              mimeType: productImageMimeType,
            })
          }
        } else {
          console.warn(`   ⚠️  No candidates in response for ${angle.name}, using original as fallback`)
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
