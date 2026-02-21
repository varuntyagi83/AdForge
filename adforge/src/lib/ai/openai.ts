import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is missing')
    }
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

export async function generateCopyVariations(
  brief: string,
  copyType: 'hook' | 'cta' | 'body' | 'tagline' | 'headline',
  lookAndFeel: string,
  count: number = 1,
  tone?: string,
  targetAudience?: string
): Promise<Array<{ promptUsed: string; generatedText: string }>> {
  const prompt = buildCopyPrompt(brief, copyType, lookAndFeel, tone, targetAudience)

  const results = []
  for (let i = 0; i < count; i++) {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert copywriter specializing in e-commerce marketing.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8, // Higher for creative variations
      max_tokens: 500,
    })

    results.push({
      promptUsed: prompt,
      generatedText: response.choices[0].message.content || '',
    })
  }

  return results
}

function buildCopyPrompt(
  brief: string,
  copyType: string,
  lookAndFeel: string,
  tone?: string,
  targetAudience?: string
): string {
  let prompt = `Write a ${copyType} for:\n${brief}\n\n`

  if (lookAndFeel) {
    prompt += `Style Guide: ${lookAndFeel}\n\n`
  }

  if (tone) {
    prompt += `Tone: ${tone}\n\n`
  }

  if (targetAudience) {
    prompt += `Target Audience: ${targetAudience}\n\n`
  }

  prompt += `Requirements:\n`

  switch (copyType) {
    case 'hook':
      prompt += `- Write a compelling 1-2 sentence hook\n- Grab attention immediately\n- Max 280 characters (Twitter-friendly)`
      break
    case 'cta':
      prompt += `- Write a strong call-to-action\n- Action-oriented, persuasive\n- Max 50 characters`
      break
    case 'headline':
      prompt += `- Write a powerful headline\n- Clear benefit or emotional trigger\n- Max 100 characters`
      break
    case 'tagline':
      prompt += `- Write a memorable tagline\n- Concise, catchy, brand-aligned\n- Max 80 characters`
      break
    case 'body':
      prompt += `- Write persuasive body copy\n- 2-4 short paragraphs\n- Focus on benefits, not features\n- Max 500 words`
      break
  }

  return prompt
}

// Legacy function for backwards compatibility
export async function generateCopy(systemPrompt: string, userPrompt: string) {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  return response.choices[0]?.message?.content || ''
}
