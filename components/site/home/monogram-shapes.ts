/**
 * The EZ monogram as vector outlines, traced by hand over the raster cut from
 * the owner's logo sheet (public/brand/ez-monogram.webp, 640×596). The 3D hero
 * extrudes these; the raster stays the logo everywhere else.
 *
 * Coordinates are the raster's pixels. The E is four separate solids — its
 * spine and three arms are distinct facets on the sheet — so the hero can
 * assemble them; the Z is one stroke and sits in front of the E, as drawn.
 */

export type Cmd =
  | ['M' | 'L', number, number]
  | ['Q', number, number, number, number]
  | ['C', number, number, number, number, number, number]

export type Piece = {
  id: 'spine' | 'top' | 'mid' | 'bottom' | 'z'
  letter: 'e' | 'z'
  path: Cmd[]
}

/** centre of the traced bounds; the scene puts the monogram's origin here */
export const ORIGIN = { x: 318, y: 295 } as const

export const PIECES: Piece[] = [
  {
    id: 'spine',
    letter: 'e',
    // its foot is cut on the diagonal the Z runs along
    path: [
      ['M', 60, 25],
      ['L', 165, 25],
      ['L', 165, 410],
      ['L', 60, 505],
    ],
  },
  {
    id: 'top',
    letter: 'e',
    path: [
      ['M', 165, 25],
      ['L', 462, 25],
      ['L', 385, 105],
      ['L', 165, 105],
    ],
  },
  {
    id: 'mid',
    letter: 'e',
    path: [
      ['M', 172, 222],
      ['L', 350, 222],
      ['L', 285, 296],
      ['L', 172, 296],
    ],
  },
  {
    id: 'bottom',
    letter: 'e',
    path: [
      ['M', 330, 425],
      ['L', 485, 425],
      ['L', 530, 495],
      ['L', 265, 495],
    ],
  },
  {
    id: 'z',
    letter: 'z',
    path: [
      // the thin tip at the top-left, then the top edge out to the corner
      ['M', 212, 200],
      ['C', 250, 165, 330, 150, 420, 146],
      ['L', 610, 135],
      // the diagonal's lower edge, ending in the calligraphic notch
      ['L', 280, 500],
      ['L', 176, 543],
      ['Q', 240, 535, 285, 506],
      // the base: top edge, the upturned hook, the underside
      ['L', 470, 503],
      ['C', 510, 503, 540, 495, 556, 486],
      ['C', 552, 515, 530, 545, 480, 560],
      ['C', 440, 568, 380, 565, 300, 565],
      ['L', 25, 565],
      // the diagonal's upper edge and the underside of the top stroke
      ['L', 440, 178],
      ['L', 320, 180],
      ['C', 270, 182, 235, 190, 212, 200],
    ],
  },
]
