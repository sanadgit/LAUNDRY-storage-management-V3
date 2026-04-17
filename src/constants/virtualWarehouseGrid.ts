/** Virtual overlay grid — matches 120 shelf slots without editing storeB.glb */
export const VIRTUAL_GRID_ROWS = 8;
export const VIRTUAL_GRID_COLS = 15;
export const VIRTUAL_GRID_CAPACITY = VIRTUAL_GRID_ROWS * VIRTUAL_GRID_COLS;

export type GridFace = 'front' | 'back';

/** Row-major flat index 0..119 */
export function virtualFlatIndex(row: number, column: number): number {
  return (row - 1) * VIRTUAL_GRID_COLS + (column - 1);
}

export function isWithinVirtualGrid(row: number, column: number): boolean {
  return row >= 1 && row <= VIRTUAL_GRID_ROWS && column >= 1 && column <= VIRTUAL_GRID_COLS;
}

/** Depth slice offset inside the 5×5 local footprint (meters, local Z) */
export const GRID_FACE_Z_OFFSET = 0.72;
