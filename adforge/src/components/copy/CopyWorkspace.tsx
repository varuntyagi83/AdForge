'use client'

import { useState } from 'react'
import { CopyGenerationForm } from './CopyGenerationForm'
import { CopyPreviewGrid } from './CopyPreviewGrid'
import { CopyGallery } from './CopyGallery'

interface GeneratedCopy {
  prompt_used: string
  generated_text: string
}

interface CopyWorkspaceProps {
  category: {
    id: string
    name: string
    slug: string
    look_and_feel: string | null
  }
  format: string
}

export function CopyWorkspace({ category, format }: CopyWorkspaceProps) {
  const [generatedCopies, setGeneratedCopies] = useState<GeneratedCopy[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentBrief, setCurrentBrief] = useState('')
  const [currentCopyType, setCurrentCopyType] = useState('hook')

  const handleGenerate = async (
    copies: GeneratedCopy[],
    brief: string,
    copyType: string
  ) => {
    setGeneratedCopies(copies)
    setCurrentBrief(brief)
    setCurrentCopyType(copyType)
  }

  const handleSaveComplete = () => {
    setGeneratedCopies([])
    setCurrentBrief('')
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-8">
      <CopyGenerationForm
        categoryId={category.id}
        lookAndFeel={category.look_and_feel || ''}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
      />

      {generatedCopies.length > 0 && (
        <CopyPreviewGrid
          categoryId={category.id}
          generatedCopies={generatedCopies}
          brief={currentBrief}
          copyType={currentCopyType}
          onSaveComplete={handleSaveComplete}
        />
      )}

      <CopyGallery categoryId={category.id} refreshTrigger={refreshKey} />
    </div>
  )
}
