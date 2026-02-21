/**
 * Predefined angle variations for product photography
 * This file can be safely imported by both client and server components
 */

export const ANGLE_VARIATIONS = [
  {
    name: 'front',
    description: 'Front view, straight on',
    prompt: 'Rotate the camera to face the product label directly head-on. The label text should be fully visible and centered. Keep the product upright and straight.',
  },
  {
    name: 'left_30deg',
    description: 'Left side, 30 degree angle',
    prompt: 'Rotate the product 30 degrees counterclockwise (to the left). The left side edge should become visible while the front label remains partially readable. The product stays upright.',
  },
  {
    name: 'right_30deg',
    description: 'Right side, 30 degree angle',
    prompt: 'Rotate the product 30 degrees clockwise (to the right). The right side edge should become visible while the front label remains partially readable. Imagine viewing the jar from the right side. The product stays upright.',
  },
  {
    name: 'top_45deg',
    description: 'Top view, 45 degree angle',
    prompt: 'Move the camera position to look down at the product from a 45-degree elevated angle. The top lid should be clearly visible, and you can see into the jar from above. The label text may be visible but at an angle.',
  },
  {
    name: 'three_quarter_left',
    description: 'Three-quarter view from left',
    prompt: 'Rotate the product about 45 degrees counterclockwise (to the left). Both the front label and the left side should be clearly visible. This is a classic product photography angle showing two faces of the container.',
  },
  {
    name: 'three_quarter_right',
    description: 'Three-quarter view from right',
    prompt: 'Rotate the product about 45 degrees clockwise (to the right). Both the front label and the right side should be clearly visible. Imagine the camera positioned to the right front of the jar, seeing two sides at once.',
  },
  {
    name: 'isometric',
    description: 'Isometric view',
    prompt: 'Create an isometric view (30-degree angle) showing the front and left side equally, with a slight elevated camera angle to also see the top. This technical drawing style shows three dimensions simultaneously.',
  },
]
