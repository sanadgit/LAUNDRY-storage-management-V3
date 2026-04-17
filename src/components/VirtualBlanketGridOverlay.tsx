import { useMemo, useRef, useState } from 'react';
import { Html, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Blanket } from '../store/useStore';
import {
  type GridFace,
  GRID_FACE_Z_OFFSET,
} from '../constants/virtualWarehouseGrid';
import {
  STORE_LOCAL_FOOTPRINT_DEPTH,
  STORE_LOCAL_FOOTPRINT_WIDTH,
} from '../constants/storeGeometry';

type VirtualGridCellState = 'empty' | 'occupied' | 'selected' | 'search';

export type VirtualGridCell = {
  row: number;
  column: number;
  store: string;
  position: THREE.Vector3;
  state: VirtualGridCellState;
};

function SearchGlowMesh({
  x,
  y,
  z,
  w,
  d,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 4) * 0.35;
    m.emissiveIntensity = pulse;
    const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.04;
    ref.current.scale.set(s, 1, s);
  });
  return (
    <mesh ref={ref} position={[x, y, z]} renderOrder={3}>
      <boxGeometry args={[w * 1.02, 0.14, d * 1.02]} />
      <meshStandardMaterial
        color="#22c55e"
        emissive="#16a34a"
        emissiveIntensity={0.6}
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </mesh>
  );
}

function SelectionPulseMesh({
  x,
  y,
  z,
  w,
  d,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 5) * 0.035;
    ref.current.scale.set(s, 1, s);
  });
  return (
    <group ref={ref} position={[x, y, z]}>
      <mesh renderOrder={4}>
        <boxGeometry args={[w * 1.06, 0.16, d * 1.06]} />
        <meshStandardMaterial
          color="#15803d"
          emissive="#4ade80"
          emissiveIntensity={0.45}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

type Props = {
  storeName: string;
  storeRows: number;
  storeCols: number;
  cellWidth: number;
  cellDepth: number;
  slotCapacity: number;
  storeBlankets: Blanket[];
  searchTargetFlats: Set<number>;
  gridFace: GridFace;
  selectedCell: { store: string; row: number; column: number } | null;
  storeSelected: boolean;
  searchQuery: string;
  searchMatch: boolean;
  onSelectCell: (cell: VirtualGridCell) => void;
};

/**
 * Transparent 3D clickable cells over the store mesh (GLB untouched).
 */
export function VirtualBlanketGridOverlay({
  storeName,
  storeRows,
  storeCols,
  cellWidth,
  cellDepth,
  slotCapacity,
  storeBlankets,
  searchTargetFlats,
  gridFace,
  selectedCell,
  storeSelected,
  searchQuery,
  searchMatch,
  onSelectCell,
}: Props) {
  const [hovered, setHovered] = useState<{ r: number; c: number } | null>(null);

  const overlayCellWidth = Math.min(20, Math.max(0.1, Number(cellWidth) || (STORE_LOCAL_FOOTPRINT_WIDTH / Math.max(1, storeCols))));
  const overlayCellDepth = Math.min(20, Math.max(0.1, Number(cellDepth) || (STORE_LOCAL_FOOTPRINT_DEPTH / Math.max(1, storeRows))));
  const gridTotalWidth = overlayCellWidth * storeCols;
  const gridTotalDepth = overlayCellDepth * storeRows;
  const gridHalfWidth = gridTotalWidth / 2;
  const gridHalfDepth = gridTotalDepth / 2;
  const zFaceShift = gridFace === 'front' ? -GRID_FACE_Z_OFFSET : GRID_FACE_Z_OFFSET;
  const rowAxisX = -Math.max(0.38, overlayCellWidth * 0.32);
  const colAxisZ = -Math.max(0.42, overlayCellDepth * 0.32) + zFaceShift;
  const boxY = 0.09;
  const gridCapacity = storeRows * storeCols;

  const storeActiveSearch = searchQuery.trim().length > 0;
  const storeHighlightSearch = storeSelected && searchMatch;

  const blanketsAt = useMemo(() => {
    const m = new Map<string, Blanket[]>();
    for (const b of storeBlankets) {
      if (b.row >= 1 && b.row <= storeRows && b.column >= 1 && b.column <= storeCols) {
        const key = `${b.row},${b.column}`;
        const list = m.get(key);
        if (list) {
          list.push(b);
        } else {
          m.set(key, [b]);
        }
      }
    }
    for (const list of m.values()) {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return m;
  }, [storeBlankets, storeRows, storeCols]);

  const cells = useMemo(() => {
    const list: { r: number; c: number }[] = [];
    for (let r = 1; r <= storeRows; r++) {
      for (let c = 1; c <= storeCols; c++) {
        list.push({ r, c });
      }
    }
    return list;
  }, [storeRows, storeCols]);

  const isSelected = (r: number, c: number) =>
    selectedCell?.store === storeName && selectedCell.row === r && selectedCell.column === c;

  return (
    <group position={[-gridHalfWidth, 0, -gridHalfDepth]} rotation={[-Math.PI / 2, 0, 0]}>
      {cells.map(({ r, c }) => {
        const key = `${r},${c}`;
        const list = blanketsAt.get(key) ?? [];
        const count = list.length;
        const latest = list.at(-1);
        const flat = (r - 1) * storeCols + (c - 1);
        const isSearch = searchTargetFlats.has(flat);
        const isHover = hovered?.r === r && hovered?.c === c;
        const sel = isSelected(r, c);

        const x = (storeCols - c) * overlayCellWidth + overlayCellWidth / 2;
        const z = (r - 1) * overlayCellDepth + overlayCellDepth / 2 + zFaceShift;

        let color = '#334155';
        let opacity = 0.06;
        let emissive = '#0f172a';
        let emissiveIntensity = 0;

        if (sel) {
          color = '#15803d';
          opacity = 0.42;
          emissive = '#22c55e';
          emissiveIntensity = 0.35;
        } else if (isSearch) {
          color = '#166534';
          opacity = 0.38;
          emissive = '#22c55e';
          emissiveIntensity = 0.4;
        } else if (count > 0) {
          color = '#f8fafc';
          opacity = 0.38;
          emissive = '#f8fafc';
          emissiveIntensity = isHover ? 0.55 : 0.32;
        } else if (isHover) {
          opacity = 0.18;
          emissive = '#94a3b8';
          emissiveIntensity = 0.22;
        }

        if (storeActiveSearch && !storeHighlightSearch && !sel && !isSearch) {
          color = '#17233d';
          opacity = Math.min(opacity, 0.08);
          emissive = '#0f172a';
          emissiveIntensity = 0;
        }

        const bw = overlayCellWidth * 0.9;
        const bd = overlayCellDepth * 0.9;

        const cellState: VirtualGridCellState = sel
          ? 'selected'
          : isSearch
          ? 'search'
          : count > 0
          ? 'occupied'
          : 'empty';

        return (
          <group key={`vcell-${r}-${c}`}>
            <mesh
              position={[x, boxY, z]}
              renderOrder={1}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onSelectCell({
                  row: r,
                  column: c,
                  store: storeName,
                  position: e.point.clone(),
                  state: cellState,
                });
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered({ r, c });
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHovered((h) => (h?.r === r && h?.c === c ? null : h));
                document.body.style.cursor = 'auto';
              }}
            >
              <boxGeometry args={[bw, 0.11, bd]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={opacity}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                depthWrite={false}
                polygonOffset
                polygonOffsetFactor={-3}
                polygonOffsetUnits={-3}
              />
            </mesh>
            {isSearch && !sel && (
              <SearchGlowMesh x={x} y={boxY} z={z} w={bw} d={bd} />
            )}
            {sel && <SelectionPulseMesh x={x} y={boxY} z={z} w={bw} d={bd} />}
            {storeHighlightSearch && r === 1 && c === 1 && (
              <group position={[gridTotalWidth / 2, boxY + 0.02, gridTotalDepth / 2 + zFaceShift]} renderOrder={2}>
                <mesh>
                  <boxGeometry args={[bw * storeCols * 1.02, 0.12, bd * storeRows * 1.02]} />
                  <meshStandardMaterial
                    color="#f87171"
                    emissive="#f87171"
                    emissiveIntensity={0.32}
                    transparent
                    opacity={0.12}
                    depthWrite={false}
                    toneMapped={false}
                  />
                </mesh>
                <mesh>
                  <boxGeometry args={[bw * storeCols * 1.08, 0.14, bd * storeRows * 1.08]} />
                  <meshStandardMaterial
                    color="#f87171" 
                    emissive="#f87171"
                    emissiveIntensity={0.18}
                    transparent
                    opacity={0.08}
                    depthWrite={false}
                    toneMapped={false}
                  />
                </mesh>
              </group>
            )}
            {(isHover || sel) && (
              <Html position={[x, boxY + 0.55, z]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
                <div className="rounded-xl border border-slate-600 bg-slate-950/95 px-3 py-2 text-center shadow-2xl backdrop-blur-md min-w-[9rem] ring-1 ring-white/10">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    {storeName} · {gridFace === 'front' ? 'أمامي' : 'خلفي'}
                  </div>
                  <div className="mt-1 text-sm font-black tabular-nums text-white">
                    Row {r} · Col {c}
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    Slot {flat + 1} / {gridCapacity}
                  </div>
                  {count > 0 ? (
                    <div className="mt-1.5 text-xs font-black text-blue-400 tabular-nums">
                      {count}/{Math.max(1, slotCapacity)} bags
                      {latest ? ` · Latest #${latest.blanket_number}` : ''}
                    </div>
                  ) : (
                    <div className="mt-1.5 text-[10px] text-slate-500">Empty</div>
                  )}
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {Array.from({ length: storeRows }, (_, i) => {
        const r = i + 1;
        const z = (r - 1) * overlayCellDepth + overlayCellDepth / 2 + zFaceShift;
        return (
          <Text
            key={`vaxis-r-${r}`}
            position={[rowAxisX, 0.14, z]}
            fontSize={Math.min(0.18, overlayCellDepth * 0.38)}
            color="#64748b"
            anchorX="right"
            anchorY="middle"
          >
            {`R${r}`}
          </Text>
        );
      })}
      {Array.from({ length: storeCols }, (_, i) => {
        const c = i + 1;
        const x = (storeCols - c) * overlayCellWidth + overlayCellWidth / 2;
        return (
          <Text
            key={`vaxis-c-${c}`}
            position={[x, 0.14, colAxisZ]}
            fontSize={Math.min(0.16, overlayCellWidth * 0.35)}
            color="#64748b"
            anchorX="center"
            anchorY="top"
          >
            {`C${c}`}
          </Text>
        );
      })}
    </group>
  );
}
