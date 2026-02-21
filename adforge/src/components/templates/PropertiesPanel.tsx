'use client'

import { TemplateLayer, SafeZone } from './TemplateBuilderCanvas'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

interface PropertiesPanelProps {
  selectedLayer: TemplateLayer | null
  selectedSafeZone: SafeZone | null
  onUpdateLayer: (id: string, updates: Partial<TemplateLayer>) => void
  onUpdateSafeZone: (id: string, updates: Partial<SafeZone>) => void
}

export function PropertiesPanel({
  selectedLayer,
  selectedSafeZone,
  onUpdateLayer,
  onUpdateSafeZone,
}: PropertiesPanelProps) {
  if (!selectedLayer && !selectedSafeZone) {
    return (
      <Card className="p-4">
        <div className="text-center py-12 text-sm text-muted-foreground">
          <p className="mb-2">No selection</p>
          <p className="text-xs">Click on a layer or safe zone to edit its properties</p>
        </div>
      </Card>
    )
  }

  if (selectedLayer) {
    return (
      <Card className="p-4">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-sm mb-1">Layer Properties</h3>
            <p className="text-xs text-muted-foreground">
              {selectedLayer.name || selectedLayer.type.toUpperCase()}
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="layer-name">Name</Label>
            <Input
              id="layer-name"
              value={selectedLayer.name || ''}
              onChange={(e) =>
                onUpdateLayer(selectedLayer.id, { name: e.target.value })
              }
              placeholder={selectedLayer.type.charAt(0).toUpperCase() + selectedLayer.type.slice(1)}
            />
          </div>

          {/* Position */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Position</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="layer-x">X (%)</Label>
                <Input
                  id="layer-x"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={selectedLayer.x.toFixed(1)}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { x: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="layer-y">Y (%)</Label>
                <Input
                  id="layer-y"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={selectedLayer.y.toFixed(1)}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, { y: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Size</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="layer-width">Width (%)</Label>
                <Input
                  id="layer-width"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={selectedLayer.width.toFixed(1)}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, {
                      width: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="layer-height">Height (%)</Label>
                <Input
                  id="layer-height"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={selectedLayer.height.toFixed(1)}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, {
                      height: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Z-index */}
          <div className="space-y-2">
            <Label htmlFor="layer-z">Z-Index (Layer Order)</Label>
            <Input
              id="layer-z"
              type="number"
              min="0"
              value={selectedLayer.z_index}
              onChange={(e) =>
                onUpdateLayer(selectedLayer.id, {
                  z_index: parseInt(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Higher values appear on top
            </p>
          </div>

          {/* Text-specific properties */}
          {selectedLayer.type === 'text' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size (px)</Label>
                <Input
                  id="font-size"
                  type="number"
                  min="8"
                  max="200"
                  value={selectedLayer.font_size || 16}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, {
                      font_size: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-family">Font Family</Label>
                <Select
                  value={selectedLayer.font_family || 'Arial'}
                  onValueChange={(value) =>
                    onUpdateLayer(selectedLayer.id, { font_family: value })
                  }
                >
                  <SelectTrigger id="font-family">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-align">Text Alignment</Label>
                <Select
                  value={selectedLayer.text_align || 'left'}
                  onValueChange={(value) =>
                    onUpdateLayer(selectedLayer.id, {
                      text_align: value as 'left' | 'center' | 'right',
                    })
                  }
                >
                  <SelectTrigger id="text-align">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={selectedLayer.color || '#000000'}
                    onChange={(e) =>
                      onUpdateLayer(selectedLayer.id, { color: e.target.value })
                    }
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={selectedLayer.color || '#000000'}
                    onChange={(e) =>
                      onUpdateLayer(selectedLayer.id, { color: e.target.value })
                    }
                    placeholder="#000000"
                  />
                </div>
              </div>
            </>
          )}

          {/* Logo-specific properties */}
          {selectedLayer.type === 'logo' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="logo-position">Position Preset</Label>
                <Select
                  value={selectedLayer.position || 'top-right'}
                  onValueChange={(value) =>
                    onUpdateLayer(selectedLayer.id, {
                      position: value as TemplateLayer['position'],
                    })
                  }
                >
                  <SelectTrigger id="logo-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-padding">Padding (px)</Label>
                <Input
                  id="logo-padding"
                  type="number"
                  min="0"
                  max="100"
                  value={selectedLayer.padding || 10}
                  onChange={(e) =>
                    onUpdateLayer(selectedLayer.id, {
                      padding: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </>
          )}

          {/* Lock toggle */}
          <div className="pt-4 border-t">
            <Button
              variant={selectedLayer.locked ? 'default' : 'outline'}
              className="w-full"
              onClick={() =>
                onUpdateLayer(selectedLayer.id, { locked: !selectedLayer.locked })
              }
            >
              {selectedLayer.locked ? '🔒 Locked' : '🔓 Unlocked'}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  if (selectedSafeZone) {
    return (
      <Card className="p-4">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-sm mb-1">Safe Zone Properties</h3>
            <p className="text-xs text-muted-foreground">{selectedSafeZone.name}</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="zone-name">Name</Label>
            <Input
              id="zone-name"
              value={selectedSafeZone.name}
              onChange={(e) =>
                onUpdateSafeZone(selectedSafeZone.id, { name: e.target.value })
              }
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="zone-type">Type</Label>
            <Select
              value={selectedSafeZone.type}
              onValueChange={(value) =>
                onUpdateSafeZone(selectedSafeZone.id, {
                  type: value as 'safe' | 'restricted',
                  color: value === 'safe' ? '#00ff00' : '#ff0000',
                })
              }
            >
              <SelectTrigger id="zone-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safe">Safe Zone (Green)</SelectItem>
                <SelectItem value="restricted">Restricted Zone (Red)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Position */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Position</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="zone-x">X (%)</Label>
                <Input
                  id="zone-x"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={selectedSafeZone.x.toFixed(1)}
                  onChange={(e) =>
                    onUpdateSafeZone(selectedSafeZone.id, {
                      x: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone-y">Y (%)</Label>
                <Input
                  id="zone-y"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={selectedSafeZone.y.toFixed(1)}
                  onChange={(e) =>
                    onUpdateSafeZone(selectedSafeZone.id, {
                      y: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Size</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="zone-width">Width (%)</Label>
                <Input
                  id="zone-width"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={selectedSafeZone.width.toFixed(1)}
                  onChange={(e) =>
                    onUpdateSafeZone(selectedSafeZone.id, {
                      width: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zone-height">Height (%)</Label>
                <Input
                  id="zone-height"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={selectedSafeZone.height.toFixed(1)}
                  onChange={(e) =>
                    onUpdateSafeZone(selectedSafeZone.id, {
                      height: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="zone-color">Zone Color</Label>
            <div className="flex gap-2">
              <Input
                id="zone-color"
                type="color"
                value={selectedSafeZone.color}
                onChange={(e) =>
                  onUpdateSafeZone(selectedSafeZone.id, { color: e.target.value })
                }
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={selectedSafeZone.color}
                onChange={(e) =>
                  onUpdateSafeZone(selectedSafeZone.id, { color: e.target.value })
                }
                placeholder="#00ff00"
              />
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return null
}
