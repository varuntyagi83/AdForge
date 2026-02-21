/**
 * Predefined angle variations for product photography
 * This file can be safely imported by both client and server components
 */

export const ANGLE_VARIATIONS = [
  {
    name: 'front',
    description: 'Front view, straight on',
    prompt: 'product facing directly forward, centered, neutral angle',
  },
  {
    name: 'left_30deg',
    description: 'Left side, 30 degree angle',
    prompt: 'product rotated 30 degrees to the left, showing left side perspective',
  },
  {
    name: 'right_30deg',
    description: 'Right side, 30 degree angle',
    prompt: 'product rotated 30 degrees to the right, showing right side perspective',
  },
  {
    name: 'top_45deg',
    description: 'Top view, 45 degree angle',
    prompt: 'product viewed from above at 45 degree angle, showing top surface',
  },
  {
    name: 'three_quarter_left',
    description: 'Three-quarter view from left',
    prompt: 'product at three-quarter angle from the left, showing front and left side',
  },
  {
    name: 'three_quarter_right',
    description: 'Three-quarter view from right',
    prompt: 'product at three-quarter angle from the right, showing front and right side',
  },
  {
    name: 'isometric',
    description: 'Isometric view',
    prompt: 'product in isometric perspective, showing three sides simultaneously',
  },
]
