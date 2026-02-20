import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

export async function generateImage(prompt: string, referenceImages?: { data: string; mimeType: string; role: string }[]) {
  const contents: any[] = []

  // Add reference images with role assignments
  if (referenceImages) {
    for (const img of referenceImages) {
      contents.push({
        inlineData: { mimeType: img.mimeType, data: img.data }
      })
    }
  }

  // Add the text prompt (always last)
  contents.push({ text: prompt })

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [{ role: 'user', parts: contents }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  })

  // Extract image parts from response
  const images: { data: string; mimeType: string }[] = []
  let text = ''

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.text) text += part.text
    if (part.inlineData) {
      images.push({
        data: part.inlineData.data!,
        mimeType: part.inlineData.mimeType!,
      })
    }
  }

  return { images, text }
}
