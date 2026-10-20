/**
 * The EZ monogram of the brand sheet v4 (brand-source/logo-sheet-v4.webp,
 * 1405/07/28) as vector outlines, traced by hand over a 640 px enlargement of
 * the sheet's large mark (sheet pixels 160–520 × 30–390, ×16/9). The 3D hero
 * extrudes these and tools/logo/mark-svg.mjs draws the favicons from them; the
 * raster cut (public/brand/ez-monogram.webp) stays the logo everywhere else.
 *
 * Six solids, as the sheet draws them: four emerald (`letter: 'e'`) — the top
 * arm, the spine, the middle arm and the half-round cap — and two gold
 * (`letter: 'z'`) — the ribbon between arm and spine, and the Z itself.
 */

export type Cmd =
  | ['M' | 'L', number, number]
  | ['Q', number, number, number, number]
  | ['C', number, number, number, number, number, number]

export type Piece = {
  id: 'top' | 'ribbon' | 'spine' | 'mid' | 'bottom' | 'z'
  letter: 'e' | 'z'
  path: Cmd[]
}

/** centre of the traced bounds; the scene puts the monogram's origin here */
export const ORIGIN = { x: 335, y: 318 } as const

export const PIECES: Piece[] = [
  {
    id: 'top',
    letter: 'e',
    // the top arm, rounding over into the head of the spine
    path: [
      ['M', 45, 212],
      ['C', 45, 110, 110, 32, 216, 31],
      ['L', 540, 32],
      ['L', 457, 112],
      ['L', 243, 111],
      ['C', 160, 113, 90, 150, 45, 212],
    ],
  },
  {
    id: 'ribbon',
    letter: 'z',
    // the gold ribbon that runs between the top arm and the spine
    path: [
      ['M', 298, 120],
      ['L', 243, 115],
      ['C', 160, 118, 92, 152, 50, 214],
      ['C', 40, 240, 38, 300, 38, 432],
      ['C', 46, 350, 70, 295, 110, 244],
      ['C', 160, 180, 225, 136, 298, 120],
    ],
  },
  {
    id: 'spine',
    letter: 'e',
    // its foot is cut on the diagonal the Z runs along
    path: [
      ['M', 178, 183],
      ['L', 182, 192],
      ['L', 182, 450],
      ['L', 46, 560],
      ['L', 45, 432],
      ['C', 52, 345, 90, 268, 178, 183],
    ],
  },
  {
    id: 'mid',
    letter: 'e',
    // the middle arm, its end turned down toward the diagonal
    path: [
      ['M', 195, 255],
      ['L', 404, 255],
      ['L', 338, 320],
      ['Q', 322, 336, 300, 336],
      ['L', 195, 336],
    ],
  },
  {
    id: 'bottom',
    letter: 'e',
    // the half-round cap that sits on the Z's base
    path: [
      ['M', 348, 495],
      ['L', 425, 424],
      ['Q', 445, 411, 475, 411],
      ['L', 515, 411],
      ['C', 565, 413, 598, 450, 598, 488],
      ['Q', 598, 505, 580, 505],
      ['L', 360, 505],
    ],
  },
  {
    id: 'z',
    letter: 'z',
    // top stroke, diagonal and base in one ribbon, as drawn
    path: [
      ['M', 280, 226],
      ['C', 320, 185, 370, 147, 415, 145],
      ['L', 600, 144],
      ['C', 625, 148, 632, 170, 628, 195],
      ['C', 624, 212, 618, 220, 612, 228],
      ['L', 330, 507],
      ['L', 597, 507],
      ['C', 602, 545, 578, 598, 500, 605],
      ['L', 50, 601],
      ['L', 470, 233],
      ['L', 340, 226],
      ['Q', 300, 224, 280, 226],
    ],
  },
]
