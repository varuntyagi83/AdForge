/**
 * Predefined angle variations for product photography
 * This file can be safely imported by both client and server components
 */

export const ANGLE_VARIATIONS = [
  {
    name: 'front',
    description: 'Front view, straight on',
    prompt: 'The jar stands VERTICALLY UPRIGHT on the surface. Position the camera directly in front facing the product label head-on. The label text should be fully visible and centered. The jar remains perfectly vertical.',
  },
  {
    name: 'left_30deg',
    description: 'Left side, 30 degree angle',
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT on the surface. Move the camera SLIGHTLY to the left (about 30 degrees from center) - the front label should STILL BE THE MAIN FOCUS taking up 70-80% of the visible jar, with just the left edge becoming slightly visible (20-30%). This is a subtle angle change, not a dramatic rotation. The jar must remain perfectly vertical and not tilted.',
  },
  {
    name: 'right_30deg',
    description: 'Right side, 30 degree angle',
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT on the surface. Move the camera SLIGHTLY to the right (about 30 degrees from center) - the front label should STILL BE THE MAIN FOCUS taking up 70-80% of the visible jar, with just the right edge becoming slightly visible (20-30%). This is a subtle angle change, not a dramatic rotation. The jar must remain perfectly vertical and not tilted.',
  },
  {
    name: 'top_45deg',
    description: 'Top view, 45 degree angle',
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT on the surface. Move the camera position to look down at the product from a 45-degree elevated angle. The top of the lid should be clearly visible. The label on the jar body should be visible but at an angle from this overhead perspective. The jar remains exactly as shown in the original.',
  },
  {
    name: 'three_quarter_left',
    description: 'Three-quarter view from left',
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT on the surface. Move the camera position about 45 degrees counterclockwise around the jar - this means you should see TWO DISTINCT FACES: the front label should take up about 60% of the visible jar surface, and the left side edge should take up about 40%. Both faces must be clearly visible, not just a slight rotation from front. This is a classic product photography angle showing two faces equally. The jar remains perfectly vertical.',
  },
  {
    name: 'three_quarter_right',
    description: 'Three-quarter view from right',
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT on the surface. Move the camera position about 45 degrees clockwise around the jar - this means you should see TWO DISTINCT FACES: the front label should take up about 60% of the visible jar surface, and the right side edge should take up about 40%. Both faces must be clearly visible, not just a slight rotation from front. The camera is positioned to see two sides at once equally. The jar remains perfectly vertical.',
  },
  {
    name: 'isometric',
    description: 'Isometric view',
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT on the surface. Create an isometric view (30-degree angle) showing the front and left side equally, with a slight elevated camera angle to also see the top. This technical drawing style shows three dimensions simultaneously. The jar remains exactly as shown in the original.',
  },
]
