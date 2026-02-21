'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Image as ImageIcon,
  Package,
  Type,
  Tag,
  Shield,
  ShieldAlert,
  Save,
  Grid3x3,
} from 'lucide-react'

interface ToolbarTemplateBuilderProps {
  onAddLayer: (type: 'background' | 'product' | 'text' | 'logo') => void
  onAddSafeZone: (type: 'safe' | 'restricted') => void
  onSave: () => void
  onToggleGrid: () => void
  gridEnabled: boolean
  isSaving: boolean
  hasChanges: boolean
}

export function ToolbarTemplateBuilder({
  onAddLayer,
  onAddSafeZone,
  onSave,
  onToggleGrid,
  gridEnabled,
  isSaving,
  hasChanges,
}: ToolbarTemplateBuilderProps) {
  return (
    <div className="border rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Add Layer Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Layer
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onAddLayer('background')}>
                <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />
                <div>
                  <div className="font-medium">Background</div>
                  <div className="text-xs text-muted-foreground">
                    Full canvas background layer
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddLayer('product')}>
                <Package className="h-4 w-4 mr-2 text-purple-500" />
                <div>
                  <div className="font-medium">Product</div>
                  <div className="text-xs text-muted-foreground">
                    Product image placeholder
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddLayer('text')}>
                <Type className="h-4 w-4 mr-2 text-orange-500" />
                <div>
                  <div className="font-medium">Text</div>
                  <div className="text-xs text-muted-foreground">
                    Headline, CTA, or body text
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddLayer('logo')}>
                <Tag className="h-4 w-4 mr-2 text-green-500" />
                <div>
                  <div className="font-medium">Logo</div>
                  <div className="text-xs text-muted-foreground">
                    Brand logo with presets
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Safe Zone Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Add Safe Zone
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onAddSafeZone('safe')}>
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                <div>
                  <div className="font-medium">Safe Zone</div>
                  <div className="text-xs text-muted-foreground">
                    Content allowed (green)
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddSafeZone('restricted')}>
                <ShieldAlert className="h-4 w-4 mr-2 text-red-500" />
                <div>
                  <div className="font-medium">Restricted Zone</div>
                  <div className="text-xs text-muted-foreground">
                    No content allowed (red)
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-border" />

          {/* Toggle Grid */}
          <Button
            variant={gridEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleGrid}
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Grid {gridEnabled ? 'On' : 'Off'}
          </Button>
        </div>

        {/* Save Button */}
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={isSaving || !hasChanges}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : hasChanges ? 'Save Template' : 'Saved'}
        </Button>
      </div>

      {/* Info banner */}
      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
        <strong>💡 Template Builder:</strong> Add layers and safe zones to define your template structure.
        Layers are placeholders that will be filled with actual content in Phase 6.
      </div>
    </div>
  )
}
