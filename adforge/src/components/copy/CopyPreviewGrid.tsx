'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Save, X, FileText } from 'lucide-react'

interface GeneratedCopy {
  prompt_used: string
  generated_text: string
}

interface CopyPreviewGridProps {
  categoryId: string
  generatedCopies: GeneratedCopy[]
  brief: string
  copyType: string
  onSaveComplete: () => void
}

export function CopyPreviewGrid({
  categoryId,
  generatedCopies,
  brief,
  copyType,
  onSaveComplete,
}: CopyPreviewGridProps) {
  const [savingIndex, setSavingIndex] = useState<number | null>(null)
  const [customNames, setCustomNames] = useState<{ [key: number]: string }>({})

  const handleSave = async (index: number, copy: GeneratedCopy) => {
    const customName = customNames[index]
    if (!customName || !customName.trim()) {
      toast.error('Please enter a name for this copy')
      return
    }

    setSavingIndex(index)

    try {
      const response = await fetch(`/api/categories/${categoryId}/copy-docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customName,
          originalText: brief,
          generatedText: copy.generated_text,
          copyType,
          language: 'en',
          promptUsed: copy.prompt_used,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Copy saved successfully')
        // Remove this copy from the preview
        if (generatedCopies.length === 1) {
          onSaveComplete()
        }
      } else {
        toast.error(data.error || 'Failed to save copy')
      }
    } catch (error) {
      console.error('Error saving copy:', error)
      toast.error('Failed to save copy')
    } finally {
      setSavingIndex(null)
    }
  }

  const handleNameChange = (index: number, value: string) => {
    setCustomNames((prev) => ({ ...prev, [index]: value }))
  }

  const getCopyTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      hook: 'Hook',
      headline: 'Headline',
      tagline: 'Tagline',
      cta: 'Call-to-Action',
      body: 'Body Copy',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            Generated {getCopyTypeLabel(copyType)}
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onSaveComplete}>
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {generatedCopies.map((copy, index) => (
          <Card key={index} className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Variation {index + 1}
                </span>
              </div>
              <div className="bg-muted/50 rounded-md p-4">
                <p className="text-sm whitespace-pre-wrap">
                  {copy.generated_text}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {copy.generated_text.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`name-${index}`}>Name this copy</Label>
              <div className="flex gap-2">
                <Input
                  id={`name-${index}`}
                  placeholder={`${getCopyTypeLabel(copyType)} ${index + 1}`}
                  value={customNames[index] || ''}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  disabled={savingIndex === index}
                />
                <Button
                  onClick={() => handleSave(index, copy)}
                  disabled={
                    savingIndex === index ||
                    !customNames[index] ||
                    !customNames[index].trim()
                  }
                  className="shrink-0"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {savingIndex === index ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
