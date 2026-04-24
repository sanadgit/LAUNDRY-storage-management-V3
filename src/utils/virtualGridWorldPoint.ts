import type { GridFace } from '../constants/virtualWarehouseGrid';
import { GRID_FACE_Z_OFFSET } from '../constants/virtualWarehouseGrid';
import {
  STORE_LOCAL_FOOTPRINT_DEPTH,
  STORE_LOCAL_FOOTPRINT_WIDTH,
} from '../constants/storeGeometry';
import type { Store } from '../store/useStore';

type Point3 = { x: number; y: number; z: number };

const normalizeCellDimension = (value: unknown, fallback: number) => {
  const fallbackNumber = Number.isFinite(Number(fallback)) ? Number(fallback) : 0.5;
  const candidate = Number(value ?? fallbackNumber);
  const parsed = Number.isFinite(candidate) ? candidate : fallbackNumber;
  const clamped = Math.min(20, Math.max(-20, parsed));
  if (Math.abs(clamped) >= 0.001) return clamped;
  return clamped < 0 || Object.is(clamped, -0) ? -0.001 : 0.001;
};

/**
 * Compute an approximate world-space focus point for a (row,column) cell on the
 * VirtualBlanketGridOverlay, matching the overlay math in `VirtualBlanketGridOverlay.tsx`.
 *
 * This allows non-3D UI (Search page) to request camera focus without a raycast.
 */
export function getVirtualGridCellWorldPoint(params: {
  store: Store;
  row: number;
  column: number;
  gridFace: GridFace;
}): Point3 {
  const { store, row, column, gridFace } = params;
  const storeRows = Math.max(1, store.rows || 1);
  const storeCols = Math.max(1, store.columns || 1);

  const cellWidth = normalizeCellDimension((store as any).cell_width, STORE_LOCAL_FOOTPRINT_WIDTH / storeCols);
  const cellDepth = normalizeCellDimension((store as any).cell_depth, STORE_LOCAL_FOOTPRINT_DEPTH / storeRows);
  const cellHeight = Math.abs(normalizeCellDimension((store as any).cell_height, 0.11));
  const gridHalfWidth = (cellWidth * storeCols) / 2;
  const gridHalfDepth = (cellDepth * storeRows) / 2;
  const zFaceShift = gridFace === 'front' ? -GRID_FACE_Z_OFFSET : GRID_FACE_Z_OFFSET;

  // Match VirtualBlanketGridOverlay:
  // x in [0..STORE_LOCAL_FOOTPRINT_WIDTH] left-to-right (mirrored so column 1 appears on the right).
  const x = (storeCols - column) * cellWidth + cellWidth / 2;
  // z in [0..STORE_LOCAL_FOOTPRINT_DEPTH] maps to vertical axis after overlay rotation (-PI/2 around X).
  const z = (row - 1) * cellDepth + cellDepth / 2 + zFaceShift;
  const boxY = Math.max(0.06, cellHeight * 0.5 + 0.03);

  // Apply the overlay group transform: rotation [-PI/2,0,0] then translation [-gridHalfWidth,0,-gridHalfDepth].
  // After rotation around X by -PI/2: (x, y, z) -> (x, z, -y)
  const overlayLocalX = x - gridHalfWidth;
  const overlayLocalY = z;
  const overlayLocalZ = -boxY - gridHalfDepth;

  // Apply store group scaling (store footprint authored for STORE_LOCAL_FOOTPRINT_WIDTH × STORE_LOCAL_FOOTPRINT_DEPTH local units).
  const sx = (store.width || STORE_LOCAL_FOOTPRINT_WIDTH) / STORE_LOCAL_FOOTPRINT_WIDTH;
  const sy = (store.height || 3) / 3;
  const sz = (store.depth || STORE_LOCAL_FOOTPRINT_DEPTH) / STORE_LOCAL_FOOTPRINT_DEPTH;

  const scaledX = overlayLocalX * sx;
  const scaledY = overlayLocalY * sy;
  const scaledZ = overlayLocalZ * sz;

  // Apply store rotation around Y.
  const rot = store.rotation_y || 0;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const rotX = scaledX * cos + scaledZ * sin;
  const rotZ = -scaledX * sin + scaledZ * cos;

  // Store group is positioned with Y at "floor", so children are centered by +height/2.
  const baseY = (store.position_y || 0) + (store.height || 3) / 2;

  return {
    x: (store.position_x || 0) + rotX,
    y: baseY + scaledY,
    z: (store.position_z || 0) + rotZ,
  };
}
