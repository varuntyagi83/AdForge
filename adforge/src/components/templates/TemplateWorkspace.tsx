'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GuidelineUploadForm } from './GuidelineUploadForm'
import type { TemplateLayer, SafeZone } from './TemplateBuilderCanvas'
import { LayerPanel } from './LayerPanel'
import { PropertiesPanel } from './PropertiesPanel'
import { ToolbarTemplateBuilder } from './ToolbarTemplateBuilder'
import { TemplateSamplePreview } from './TemplateSamplePreview'
import { TemplateGallery } from './TemplateGallery'
import { toast } from 'sonner'

// Dynamic import for TemplateBuilderCanvas (uses Konva which is client-only)
const TemplateBuilderCanvas = dynamic(
  () => import('./TemplateBuilderCanvas').then((mod) => ({ default: mod.TemplateBuilderCanvas })),
  { ssr: false }
)

interface Guideline {
  id: string
  name: string
  storage_url: string
  created_at: string
}

interface Template {
  id: string
  name: string
  description: string | null
  format: string
  width: number
  height: number
  template_data: {
    layers: TemplateLayer[]
    safe_zones: SafeZone[]
  }
  created_at: string
  updated_at: string
}

interface TemplateWorkspaceProps {
  categoryId: string
}

export function TemplateWorkspace({ categoryId }: TemplateWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('upload')
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null)

  const [layers, setLayers] = useState<TemplateLayer[]>([])
  const [safeZones, setSafeZones] = useState<SafeZone[]>([])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [selectedSafeZoneId, setSelectedSafeZoneId] = useState<string | null>(null)
  const [gridEnabled, setGridEnabled] = useState(true)

  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch guidelines
  const fetchGuidelines = async () => {
    try {
      const response = await fetch(`/api/categories/${categoryId}/guidelines`)
      const data = await response.json()
      if (response.ok) {
        setGuidelines(data.guidelines || [])
        if (data.guidelines && data.guidelines.length > 0 && !selectedGuideline) {
          setSelectedGuideline(data.guidelines[0])
        }
      }
    } catch (error) {
      console.error('Error fetching guidelines:', error)
    }
  }

  // Fetch existing template
  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/categories/${categoryId}/templates`)
      const data = await response.json()
      if (response.ok && data.templates && data.templates.length > 0) {
        const template = data.templates[0]
        setCurrentTemplateId(template.id)
        setLayers(template.template_data.layers || [])
        setSafeZones(template.template_data.safe_zones || [])
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error fetching template:', error)
    }
  }

  useEffect(() => {
    fetchGuidelines()
    fetchTemplate()
  }, [categoryId])

  useEffect(() => {
    setHasChanges(true)
  }, [layers, safeZones])

  // Add layer
  const handleAddLayer = (type: TemplateLayer['type']) => {
    const newLayer: TemplateLayer = {
      id: `layer-${Date.now()}`,
      type,
      name: '',
      x: 25,
      y: 25,
      width: type === 'background' ? 100 : 50,
      height: type === 'background' ? 100 : 50,
      z_index: layers.length,
      locked: false,
    }

    // Type-specific defaults
    if (type === 'text') {
      newLayer.font_size = 24
      newLayer.font_family = 'Arial'
      newLayer.color = '#000000'
      newLayer.text_align = 'center'
    } else if (type === 'logo') {
      newLayer.position = 'top-right'
      newLayer.padding = 10
      newLayer.width = 15
      newLayer.height = 15
    }

    setLayers([...layers, newLayer])
    setSelectedLayerId(newLayer.id)
    setSelectedSafeZoneId(null)
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} layer added`)
  }

  // Add safe zone
  const handleAddSafeZone = (type: 'safe' | 'restricted') => {
    const newZone: SafeZone = {
      id: `zone-${Date.now()}`,
      name: type === 'safe' ? 'Safe Zone' : 'Restricted Zone',
      x: 20,
      y: 20,
      width: 60,
      height: 60,
      type,
      color: type === 'safe' ? '#00ff00' : '#ff0000',
    }

    setSafeZones([...safeZones, newZone])
    setSelectedSafeZoneId(newZone.id)
    setSelectedLayerId(null)
    toast.success(`${type === 'safe' ? 'Safe' : 'Restricted'} zone added`)
  }

  // Update layer
  const handleUpdateLayer = (id: string, updates: Partial<TemplateLayer>) => {
    setLayers(layers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer)))
  }

  // Update safe zone
  const handleUpdateSafeZone = (id: string, updates: Partial<SafeZone>) => {
    setSafeZones(safeZones.map((zone) => (zone.id === id ? { ...zone, ...updates } : zone)))
  }

  // Delete layer
  const handleDeleteLayer = (id: string) => {
    setLayers(layers.filter((layer) => layer.id !== id))
    if (selectedLayerId === id) {
      setSelectedLayerId(null)
    }
  }

  // Reorder layers
  const handleReorderLayers = (newLayers: TemplateLayer[]) => {
    setLayers(newLayers)
  }

  // Save template
  const handleSave = async () => {
    if (layers.length === 0) {
      toast.error('Add at least one layer before saving')
      return
    }

    setIsSaving(true)

    try {
      const templateData = {
        layers,
        safe_zones: safeZones,
      }

      if (currentTemplateId) {
        // Update existing template
        const response = await fetch(
          `/api/categories/${categoryId}/templates/${currentTemplateId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ template_data: templateData }),
          }
        )

        const data = await response.json()

        if (response.ok) {
          toast.success('Template updated successfully')
          setHasChanges(false)
          setRefreshTrigger((prev) => prev + 1)
        } else {
          toast.error(data.error || 'Failed to update template')
        }
      } else {
        // Create new template
        const response = await fetch(`/api/categories/${categoryId}/templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Template 1:1',
            description: 'Instagram square template (1080x1080)',
            format: '1:1',
            width: 1080,
            height: 1080,
            template_data: templateData,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          toast.success('Template created successfully')
          setCurrentTemplateId(data.template.id)
          setHasChanges(false)
          setRefreshTrigger((prev) => prev + 1)
        } else {
          toast.error(data.error || 'Failed to create template')
        }
      }
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  // Edit template from gallery
  const handleEditTemplate = (template: Template) => {
    setCurrentTemplateId(template.id)
    setLayers(template.template_data.layers || [])
    setSafeZones(template.template_data.safe_zones || [])
    setActiveTab('builder')
    toast.info('Template loaded for editing')
  }

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null
  const selectedSafeZone = safeZones.find((z) => z.id === selectedSafeZoneId) || null

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upload">Upload Guidelines</TabsTrigger>
          <TabsTrigger value="builder">Template Builder</TabsTrigger>
          <TabsTrigger value="preview">Sample Preview</TabsTrigger>
          <TabsTrigger value="gallery">Saved Templates</TabsTrigger>
        </TabsList>

        {/* Tab 1: Upload Guidelines */}
        <TabsContent value="upload" className="space-y-4">
          <GuidelineUploadForm
            categoryId={categoryId}
            onUploadComplete={() => {
              fetchGuidelines()
              toast.success('Guideline uploaded! Now create your template.')
            }}
          />

          {/* Guideline selector */}
          {guidelines.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Select Guideline for Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {guidelines.map((guideline) => (
                  <div
                    key={guideline.id}
                    onClick={() => setSelectedGuideline(guideline)}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedGuideline?.id === guideline.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary'
                        : 'hover:border-gray-400'
                    }`}
                  >
                    <div className="text-sm font-medium truncate">{guideline.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(guideline.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Template Builder */}
        <TabsContent value="builder" className="space-y-4">
          <ToolbarTemplateBuilder
            onAddLayer={handleAddLayer}
            onAddSafeZone={handleAddSafeZone}
            onSave={handleSave}
            onToggleGrid={() => setGridEnabled(!gridEnabled)}
            gridEnabled={gridEnabled}
            isSaving={isSaving}
            hasChanges={hasChanges}
          />

          <div className="grid grid-cols-12 gap-4">
            {/* Left Panel: Layers */}
            <div className="col-span-3">
              <LayerPanel
                layers={layers}
                selectedLayerId={selectedLayerId}
                onSelectLayer={setSelectedLayerId}
                onUpdateLayer={handleUpdateLayer}
                onDeleteLayer={handleDeleteLayer}
                onReorderLayers={handleReorderLayers}
              />
            </div>

            {/* Center: Canvas */}
            <div className="col-span-6">
              <TemplateBuilderCanvas
                layers={layers}
                safeZones={safeZones}
                selectedLayerId={selectedLayerId}
                selectedSafeZoneId={selectedSafeZoneId}
                onLayerUpdate={handleUpdateLayer}
                onSafeZoneUpdate={handleUpdateSafeZone}
                onSelectLayer={setSelectedLayerId}
                onSelectSafeZone={setSelectedSafeZoneId}
                guidelineImageUrl={selectedGuideline?.storage_url}
                gridEnabled={gridEnabled}
                gridSize={10}
              />
            </div>

            {/* Right Panel: Properties */}
            <div className="col-span-3">
              <PropertiesPanel
                selectedLayer={selectedLayer}
                selectedSafeZone={selectedSafeZone}
                onUpdateLayer={handleUpdateLayer}
                onUpdateSafeZone={handleUpdateSafeZone}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Sample Preview */}
        <TabsContent value="preview">
          <TemplateSamplePreview
            guidelineImageUrl={selectedGuideline?.storage_url}
            safeZones={safeZones}
            layers={layers}
          />
        </TabsContent>

        {/* Tab 4: Saved Templates */}
        <TabsContent value="gallery">
          <TemplateGallery
            categoryId={categoryId}
            refreshTrigger={refreshTrigger}
            onEdit={handleEditTemplate}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
