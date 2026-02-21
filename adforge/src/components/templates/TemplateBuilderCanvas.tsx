'use client'

import { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Rect, Text, Transformer } from 'react-konva'
import Konva from 'konva'
import { KonvaEventObject } from 'konva/lib/Node'

// Canvas dimensions (fixed 1:1 format)
const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1080

export interface TemplateLayer {
  id: string
  type: 'background' | 'product' | 'text' | 'logo'
  name?: string
  x: number // percentage (0-100)
  y: number // percentage (0-100)
  width: number // percentage (0-100)
  height: number // percentage (0-100)
  z_index: number
  locked: boolean
  // Text-specific properties
  font_size?: number
  font_family?: string
  color?: string
  text_align?: 'left' | 'center' | 'right'
  // Logo-specific properties
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  padding?: number
}

export interface SafeZone {
  id: string
  name: string
  x: number // percentage (0-100)
  y: number // percentage (0-100)
  width: number // percentage (0-100)
  height: number // percentage (0-100)
  type: 'safe' | 'restricted'
  color: string
}

interface TemplateBuilderCanvasProps {
  layers: TemplateLayer[]
  safeZones: SafeZone[]
  selectedLayerId: string | null
  selectedSafeZoneId: string | null
  onLayerUpdate: (id: string, updates: Partial<TemplateLayer>) => void
  onSafeZoneUpdate: (id: string, updates: Partial<SafeZone>) => void
  onSelectLayer: (id: string | null) => void
  onSelectSafeZone: (id: string | null) => void
  guidelineImageUrl?: string
  gridEnabled?: boolean
  gridSize?: number
}

export function TemplateBuilderCanvas({
  layers,
  safeZones,
  selectedLayerId,
  selectedSafeZoneId,
  onLayerUpdate,
  onSafeZoneUpdate,
  onSelectLayer,
  onSelectSafeZone,
  guidelineImageUrl,
  gridEnabled = true,
  gridSize = 10,
}: TemplateBuilderCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [guidelineImage, setGuidelineImage] = useState<HTMLImageElement | null>(null)
  const [displayScale, setDisplayScale] = useState(1)

  // Load guideline image
  useEffect(() => {
    if (guidelineImageUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => setGuidelineImage(img)
      img.src = guidelineImageUrl
    } else {
      setGuidelineImage(null)
    }
  }, [guidelineImageUrl])

  // Calculate display scale to fit canvas in viewport
  useEffect(() => {
    const updateScale = () => {
      const container = stageRef.current?.container()
      if (container) {
        const containerWidth = container.offsetWidth
        const scale = Math.min(containerWidth / CANVAS_WIDTH, 1)
        setDisplayScale(scale)
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Update transformer when selection changes
  useEffect(() => {
    const transformer = transformerRef.current
    if (!transformer) return

    const stage = stageRef.current
    if (!stage) return

    if (selectedLayerId) {
      const node = stage.findOne(`#${selectedLayerId}`)
      if (node) {
        transformer.nodes([node])
      }
    } else if (selectedSafeZoneId) {
      const node = stage.findOne(`#${selectedSafeZoneId}`)
      if (node) {
        transformer.nodes([node])
      }
    } else {
      transformer.nodes([])
    }
    transformer.getLayer()?.batchDraw()
  }, [selectedLayerId, selectedSafeZoneId])

  // Convert percentage to pixels
  const toPixels = (percent: number, dimension: 'width' | 'height') => {
    return (percent / 100) * (dimension === 'width' ? CANVAS_WIDTH : CANVAS_HEIGHT)
  }

  // Convert pixels to percentage
  const toPercent = (pixels: number, dimension: 'width' | 'height') => {
    return (pixels / (dimension === 'width' ? CANVAS_WIDTH : CANVAS_HEIGHT)) * 100
  }

  // Get layer color by type
  const getLayerColor = (type: TemplateLayer['type']) => {
    switch (type) {
      case 'background':
        return '#3b82f6' // blue
      case 'product':
        return '#8b5cf6' // purple
      case 'text':
        return '#f59e0b' // orange
      case 'logo':
        return '#10b981' // green
      default:
        return '#6b7280'
    }
  }

  // Handle layer drag
  const handleLayerDragEnd = (layer: TemplateLayer, e: KonvaEventObject<DragEvent>) => {
    if (layer.locked) return

    const node = e.target
    const x = toPercent(node.x(), 'width')
    const y = toPercent(node.y(), 'height')

    onLayerUpdate(layer.id, { x, y })
  }

  // Handle layer transform (resize)
  const handleLayerTransformEnd = (layer: TemplateLayer, e: KonvaEventObject<Event>) => {
    if (layer.locked) return

    const node = e.target as Konva.Rect
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    // Reset scale and apply to width/height
    node.scaleX(1)
    node.scaleY(1)

    const width = toPercent(node.width() * scaleX, 'width')
    const height = toPercent(node.height() * scaleY, 'height')
    const x = toPercent(node.x(), 'width')
    const y = toPercent(node.y(), 'height')

    onLayerUpdate(layer.id, { x, y, width, height })
  }

  // Handle safe zone drag
  const handleSafeZoneDragEnd = (zone: SafeZone, e: KonvaEventObject<DragEvent>) => {
    const node = e.target
    const x = toPercent(node.x(), 'width')
    const y = toPercent(node.y(), 'height')

    onSafeZoneUpdate(zone.id, { x, y })
  }

  // Handle safe zone transform
  const handleSafeZoneTransformEnd = (zone: SafeZone, e: KonvaEventObject<Event>) => {
    const node = e.target as Konva.Rect
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

    node.scaleX(1)
    node.scaleY(1)

    const width = toPercent(node.width() * scaleX, 'width')
    const height = toPercent(node.height() * scaleY, 'height')
    const x = toPercent(node.x(), 'width')
    const y = toPercent(node.y(), 'height')

    onSafeZoneUpdate(zone.id, { x, y, width, height })
  }

  // Handle canvas click (deselect)
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      onSelectLayer(null)
      onSelectSafeZone(null)
    }
  }

  // Sort layers by z_index
  const sortedLayers = [...layers].sort((a, b) => a.z_index - b.z_index)

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50">
      <div className="relative" style={{ width: '100%', aspectRatio: '1/1' }}>
        <Stage
          ref={stageRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          scaleX={displayScale}
          scaleY={displayScale}
          style={{
            width: '100%',
            height: '100%',
          }}
          onClick={handleStageClick}
        >
          {/* Background layer */}
          <Layer>
            {/* Grid */}
            {gridEnabled && (
              <>
                {Array.from({ length: Math.ceil(CANVAS_WIDTH / gridSize) }).map((_, i) => (
                  <Rect
                    key={`grid-v-${i}`}
                    x={i * gridSize}
                    y={0}
                    width={1}
                    height={CANVAS_HEIGHT}
                    fill="#e5e7eb"
                  />
                ))}
                {Array.from({ length: Math.ceil(CANVAS_HEIGHT / gridSize) }).map((_, i) => (
                  <Rect
                    key={`grid-h-${i}`}
                    x={0}
                    y={i * gridSize}
                    width={CANVAS_WIDTH}
                    height={1}
                    fill="#e5e7eb"
                  />
                ))}
              </>
            )}

            {/* Guideline image (if uploaded) */}
            {guidelineImage && (
              <Rect
                x={0}
                y={0}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                fillPatternImage={guidelineImage}
                fillPatternScaleX={CANVAS_WIDTH / guidelineImage.width}
                fillPatternScaleY={CANVAS_HEIGHT / guidelineImage.height}
                opacity={0.3}
                listening={false}
              />
            )}

            {/* Safe zones */}
            {safeZones.map((zone) => (
              <Rect
                key={zone.id}
                id={zone.id}
                x={toPixels(zone.x, 'width')}
                y={toPixels(zone.y, 'height')}
                width={toPixels(zone.width, 'width')}
                height={toPixels(zone.height, 'height')}
                fill={zone.color}
                opacity={0.25}
                stroke={zone.color}
                strokeWidth={2}
                draggable
                onDragEnd={(e) => handleSafeZoneDragEnd(zone, e)}
                onTransformEnd={(e) => handleSafeZoneTransformEnd(zone, e)}
                onClick={() => {
                  onSelectSafeZone(zone.id)
                  onSelectLayer(null)
                }}
              />
            ))}

            {/* Layer placeholders */}
            {sortedLayers.map((layer) => {
              const color = getLayerColor(layer.type)
              const isSelected = layer.id === selectedLayerId

              return (
                <Rect
                  key={layer.id}
                  id={layer.id}
                  x={toPixels(layer.x, 'width')}
                  y={toPixels(layer.y, 'height')}
                  width={toPixels(layer.width, 'width')}
                  height={toPixels(layer.height, 'height')}
                  fill={color}
                  opacity={layer.type === 'background' ? 0.1 : 0.2}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                  dash={[10, 5]}
                  draggable={!layer.locked}
                  onDragEnd={(e) => handleLayerDragEnd(layer, e)}
                  onTransformEnd={(e) => handleLayerTransformEnd(layer, e)}
                  onClick={() => {
                    onSelectLayer(layer.id)
                    onSelectSafeZone(null)
                  }}
                />
              )
            })}

            {/* Layer labels */}
            {sortedLayers.map((layer) => {
              const color = getLayerColor(layer.type)
              return (
                <Text
                  key={`label-${layer.id}`}
                  x={toPixels(layer.x, 'width') + 5}
                  y={toPixels(layer.y, 'height') + 5}
                  text={layer.name || layer.type.toUpperCase()}
                  fontSize={16}
                  fontStyle="bold"
                  fill={color}
                  listening={false}
                />
              )
            })}

            {/* Safe zone labels */}
            {safeZones.map((zone) => (
              <Text
                key={`label-${zone.id}`}
                x={toPixels(zone.x, 'width') + 5}
                y={toPixels(zone.y, 'height') + 5}
                text={zone.name}
                fontSize={14}
                fontStyle="bold"
                fill={zone.color}
                listening={false}
              />
            ))}

            {/* Transformer for resize handles */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit resize to canvas bounds
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox
                }
                return newBox
              }}
            />
          </Layer>
        </Stage>
      </div>

      {/* Canvas info */}
      <div className="px-4 py-2 bg-white border-t text-xs text-muted-foreground">
        Canvas: {CANVAS_WIDTH}x{CANVAS_HEIGHT} (1:1) • Scale: {(displayScale * 100).toFixed(0)}%
        {gridEnabled && ` • Grid: ${gridSize}px`}
      </div>
    </div>
  )
}
