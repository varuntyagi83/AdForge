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
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT on the surface. Move the camera position 30 degrees counterclockwise around the jar (imagine walking around to the left side of the jar). The left side edge should become visible while the front label remains partially readable. The jar must remain perfectly vertical and not tilted.',
  },
  {
    name: 'right_30deg',
    description: 'Right side, 30 degree angle',
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT on the surface. Move the camera position 30 degrees clockwise around the jar (imagine walking around to the right side of the jar). The right side edge should become visible while the front label remains partially readable. The jar must remain perfectly vertical and not tilted.',
  },
  {
    name: 'top_45deg',
    description: 'Top view, 45 degree angle',
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT with the LID CLOSED on the surface. Move the camera position to look down at the product from a 45-degree elevated angle. The top of the closed black lid should be clearly visible. The label on the jar body should be visible but at an angle from this overhead perspective. DO NOT open the lid - keep it sealed and closed.',
  },
  {
    name: 'three_quarter_left',
    description: 'Three-quarter view from left',
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT on the surface. Move the camera position about 45 degrees counterclockwise around the jar. Both the front label and the left side should be clearly visible. This is a classic product photography angle showing two faces of the container. The jar remains perfectly vertical.',
  },
  {
    name: 'three_quarter_right',
    description: 'Three-quarter view from right',
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT on the surface. Move the camera position about 45 degrees clockwise around the jar. Both the front label and the right side should be clearly visible. The camera is positioned to the right front of the jar, seeing two sides at once. The jar remains perfectly vertical.',
  },
  {
    name: 'isometric',
    description: 'Isometric view',
    prompt: 'Keep the jar standing VERTICALLY UPRIGHT with the LID CLOSED. Create an isometric view (30-degree angle) showing the front and left side equally, with a slight elevated camera angle to also see the top of the closed black lid. This technical drawing style shows three dimensions simultaneously. The lid remains closed.',
  },
]
