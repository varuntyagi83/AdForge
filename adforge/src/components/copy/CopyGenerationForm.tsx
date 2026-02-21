'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

interface CopyGenerationFormProps {
  categoryId: string
  lookAndFeel: string
  onGenerate: (
    copies: any[],
    brief: string,
    copyType: string
  ) => void
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
}

export function CopyGenerationForm({
  categoryId,
  lookAndFeel,
  onGenerate,
  isGenerating,
  setIsGenerating,
}: CopyGenerationFormProps) {
  const [brief, setBrief] = useState('')
  const [copyType, setCopyType] = useState<string>('hook')
  const [count, setCount] = useState<number[]>([1])
  const [tone, setTone] = useState<string>('')
  const [targetAudience, setTargetAudience] = useState('')

  const handleGenerate = async () => {
    if (!brief.trim()) {
      toast.error('Please enter a brief or description')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch(
        `/api/categories/${categoryId}/copy-docs/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brief,
            copyType,
            count: count[0],
            tone: tone || undefined,
            targetAudience: targetAudience || undefined,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        toast.success(`Generated ${data.results.length} variations`)
        onGenerate(data.results, brief, copyType)
      } else {
        toast.error(data.error || 'Failed to generate copy')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to generate copy')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Generate Marketing Copy</h2>
      </div>

      {lookAndFeel && (
        <div className="bg-muted/50 rounded-md p-3 text-sm">
          <p className="text-muted-foreground">
            <strong>Style Guide:</strong> {lookAndFeel}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="brief">Brief / Description</Label>
          <Textarea
            id="brief"
            placeholder="Describe your product or what you want to communicate..."
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {brief.length}/500 characters
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="copyType">Copy Type</Label>
            <Select value={copyType} onValueChange={setCopyType}>
              <SelectTrigger id="copyType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hook">Hook</SelectItem>
                <SelectItem value="headline">Headline</SelectItem>
                <SelectItem value="tagline">Tagline</SelectItem>
                <SelectItem value="cta">Call-to-Action</SelectItem>
                <SelectItem value="body">Body Copy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tone">Tone (Optional)</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone">
                <SelectValue placeholder="Select tone..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="empathetic">Empathetic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="audience">Target Audience (Optional)</Label>
          <Textarea
            id="audience"
            placeholder="e.g., Millennials interested in health and wellness..."
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            rows={2}
            maxLength={200}
          />
        </div>

        <div>
          <Label>Number of Variations: {count[0]}</Label>
          <Slider
            value={count}
            onValueChange={setCount}
            min={1}
            max={5}
            step={1}
            className="mt-2"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !brief.trim()}
          className="w-full"
          size="lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating
            ? 'Generating...'
            : `Generate ${count[0]} Variation${count[0] > 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  )
}
