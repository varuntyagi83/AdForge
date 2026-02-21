'use client'

import { TemplateLayer } from './TemplateBuilderCanvas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayerPanelProps {
  layers: TemplateLayer[]
  selectedLayerId: string | null
  onSelectLayer: (id: string | null) => void
  onUpdateLayer: (id: string, updates: Partial<TemplateLayer>) => void
  onDeleteLayer: (id: string) => void
  onReorderLayers: (layers: TemplateLayer[]) => void
}

export function LayerPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onReorderLayers,
}: LayerPanelProps) {
  // Sort layers by z_index (highest first for display)
  const sortedLayers = [...layers].sort((a, b) => b.z_index - a.z_index)

  const getLayerIcon = (type: TemplateLayer['type']) => {
    switch (type) {
      case 'background':
        return '🖼️'
      case 'product':
        return '📦'
      case 'text':
        return '📝'
      case 'logo':
        return '🏷️'
      default:
        return '📄'
    }
  }

  const getLayerColor = (type: TemplateLayer['type']) => {
    switch (type) {
      case 'background':
        return 'bg-blue-100 border-blue-300'
      case 'product':
        return 'bg-purple-100 border-purple-300'
      case 'text':
        return 'bg-orange-100 border-orange-300'
      case 'logo':
        return 'bg-green-100 border-green-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const handleMoveUp = (layer: TemplateLayer) => {
    const currentIndex = sortedLayers.findIndex((l) => l.id === layer.id)
    if (currentIndex > 0) {
      const newLayers = [...sortedLayers]
      const [movedLayer] = newLayers.splice(currentIndex, 1)
      newLayers.splice(currentIndex - 1, 0, movedLayer)

      // Update z_index values
      const reorderedLayers = newLayers.reverse().map((l, idx) => ({
        ...l,
        z_index: idx,
      }))
      onReorderLayers(reorderedLayers)
    }
  }

  const handleMoveDown = (layer: TemplateLayer) => {
    const currentIndex = sortedLayers.findIndex((l) => l.id === layer.id)
    if (currentIndex < sortedLayers.length - 1) {
      const newLayers = [...sortedLayers]
      const [movedLayer] = newLayers.splice(currentIndex, 1)
      newLayers.splice(currentIndex + 1, 0, movedLayer)

      // Update z_index values
      const reorderedLayers = newLayers.reverse().map((l, idx) => ({
        ...l,
        z_index: idx,
      }))
      onReorderLayers(reorderedLayers)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Layers</h3>
        <span className="text-xs text-muted-foreground">{layers.length} layers</span>
      </div>

      {layers.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No layers yet. Add layers using the toolbar above.
        </div>
      ) : (
        <div className="space-y-2">
          {sortedLayers.map((layer, index) => {
            const isSelected = layer.id === selectedLayerId

            return (
              <div
                key={layer.id}
                className={cn(
                  'border rounded-lg p-3 cursor-pointer transition-all',
                  getLayerColor(layer.type),
                  isSelected && 'ring-2 ring-primary shadow-md',
                  layer.locked && 'opacity-60'
                )}
                onClick={() => onSelectLayer(layer.id)}
              >
                <div className="flex items-center gap-2">
                  {/* Drag handle */}
                  <div className="flex flex-col gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveUp(layer)
                      }}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveDown(layer)
                      }}
                      disabled={index === sortedLayers.length - 1}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Layer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getLayerIcon(layer.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {layer.name || layer.type.charAt(0).toUpperCase() + layer.type.slice(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Z: {layer.z_index} • {layer.width.toFixed(0)}x{layer.height.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdateLayer(layer.id, { locked: !layer.locked })
                      }}
                      title={layer.locked ? 'Unlock' : 'Lock'}
                    >
                      {layer.locked ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (
                          confirm(
                            `Delete layer "${layer.name || layer.type}"? This action cannot be undone.`
                          )
                        ) {
                          onDeleteLayer(layer.id)
                        }
                      }}
                      title="Delete layer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p className="mb-1">💡 <strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Click to select a layer</li>
            <li>Use arrows to reorder (changes Z-index)</li>
            <li>Lock layers to prevent edits</li>
            <li>Drag on canvas to reposition</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
