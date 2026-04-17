import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Grid, 
  Text, 
  TransformControls, 
  useGLTF,
  Html,
  Outlines,
} from '@react-three/drei';
import { useStore, Store as StoreType, type Blanket } from '../store/useStore';
import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { GRID_FACE_Z_OFFSET } from '../constants/virtualWarehouseGrid';
import { VirtualBlanketGridOverlay } from './VirtualBlanketGridOverlay';
import { 
  AlertTriangle,
  Check,
  Move,
  RotateCw,
  Maximize,
  Package,
  Plus,
  SlidersHorizontal,
  Sun,
  Video,
  Crosshair,
  RotateCcw,
  Layers,
  Box,
  X,
} from 'lucide-react';
import { useViewer3D } from '../context/Viewer3DSettings';
import {
  STORE_LOCAL_FOOTPRINT_DEPTH,
  STORE_LOCAL_FOOTPRINT_WIDTH,
} from '../constants/storeGeometry';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// SAT Collision Detection Helpers
const getCorners = (x: number, z: number, w: number, d: number, rot: number) => {
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const hw = w / 2;
  const hd = d / 2;
  return [
    { x: x + cos * hw - sin * hd, z: z + sin * hw + cos * hd },
    { x: x - cos * hw - sin * hd, z: z - sin * hw + cos * hd },
    { x: x - cos * hw + sin * hd, z: z - sin * hw - cos * hd },
    { x: x + cos * hw + sin * hd, z: z + sin * hw - cos * hd },
  ];
};

const getAxes = (corners: { x: number; z: number }[]) => {
  const axes = [];
  for (let i = 0; i < 4; i++) {
    const p1 = corners[i];
    const p2 = corners[(i + 1) % 4];
    axes.push({ x: -(p1.z - p2.z), z: p1.x - p2.x });
  }
  return axes;
};

const project = (corners: { x: number; z: number }[], axis: { x: number; z: number }) => {
  let min = Infinity;
  let max = -Infinity;
  for (const p of corners) {
    const dot = p.x * axis.x + p.z * axis.z;
    min = Math.min(min, dot);
    max = Math.max(max, dot);
  }
  return { min, max };
};

const checkStoreCollision = (s1: any, s2: any) => {
  const yOverlap = s1.position_y < s2.position_y + s2.height && s2.position_y < s1.position_y + s1.height;
  if (!yOverlap) return false;

  const c1 = getCorners(s1.position_x, s1.position_z, s1.width, s1.depth, s1.rotation_y);
  const c2 = getCorners(s2.position_x, s2.position_z, s2.width, s2.depth, s2.rotation_y);
  const axes = [...getAxes(c1), ...getAxes(c2)];

  for (const axis of axes) {
    const p1 = project(c1, axis);
    const p2 = project(c2, axis);
    if (p1.max < p2.min || p2.max < p1.min) return false;
  }
  return true;
};

function ShopModel({
  opacity,
  scale,
  position,
  rotationY,
}: {
  opacity: number;
  scale: number;
  position: [number, number, number];
  rotationY: number;
}) {
  const gltf = useGLTF('/models/shop.glb');

  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as unknown as THREE.Mesh;
      if (!('isMesh' in mesh) || !(mesh as any).isMesh) return;

      (mesh as any).castShadow = false;
      (mesh as any).receiveShadow = false;
      (mesh as any).renderOrder = -10;
      (mesh as any).raycast = () => null;

      const currentMaterial = (mesh as any).material as THREE.Material | THREE.Material[] | undefined;
      if (!currentMaterial) return;

      if (!(mesh as any).userData.__shopMaterialInitialized) {
        const normalize = Array.isArray(currentMaterial) ? currentMaterial : [currentMaterial];
        const cloned = normalize.map((mat) => mat.clone());
        (mesh as any).material = Array.isArray(currentMaterial) ? cloned : cloned[0];
        (mesh as any).userData.__shopMaterialInitialized = true;
      }

      const normalized = Array.isArray((mesh as any).material) ? (mesh as any).material : [(mesh as any).material];
      for (const mat of normalized) {
        if (!mat) continue;
        mat.transparent = true;
        mat.opacity = opacity;
        mat.depthWrite = false;
        mat.side = THREE.DoubleSide;
        mat.needsUpdate = true;
      }
    });
  }, [scene, opacity]);

  return (
    <primitive
      object={scene}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
    />
  );
}

function CameraAndFocusSync() {
  const { camera } = useThree();
  const {
    settings,
    orbitControlsRef,
    cameraResetToken,
    focusSelectedToken,
    cellFocusToken,
    cellFocusTargetRef,
  } = useViewer3D();
  const { stores, selectedStore } = useStore();

  const cellAnimRef = useRef<{
    active: boolean;
    start: number;
    duration: number;
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
  } | null>(null);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = settings.cameraFov;
    cam.updateProjectionMatrix();
  }, [settings.cameraFov, camera]);

  useEffect(() => {
    if (cameraResetToken === 0) return;
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(20, 20, 20);
    cam.fov = settings.cameraFov;
    cam.updateProjectionMatrix();
    const oc = orbitControlsRef.current;
    if (oc) {
      oc.target.set(0, 0, 0);
      oc.update();
    }
  }, [cameraResetToken, settings.cameraFov, camera, orbitControlsRef]);

  useEffect(() => {
    if (focusSelectedToken === 0) return;
    if (!selectedStore) return;
    const store = stores.find((s) => s.store_name === selectedStore);
    if (!store) return;
    const h = store.height || 3;
    const target = new THREE.Vector3(
      store.position_x,
      store.position_y + h / 2,
      store.position_z
    );
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(target.x + 14, target.y + 10, target.z + 14);
    cam.fov = settings.cameraFov;
    cam.updateProjectionMatrix();
    const oc = orbitControlsRef.current;
    if (oc) {
      oc.target.copy(target);
      oc.update();
    }
  }, [focusSelectedToken, selectedStore, stores, camera, orbitControlsRef, settings.cameraFov]);

  useEffect(() => {
    if (cellFocusToken === 0) return;
    const p = cellFocusTargetRef.current;
    if (!p) return;
    const cam = camera as THREE.PerspectiveCamera;
    const oc = orbitControlsRef.current;
    if (!oc) return;
    const target = new THREE.Vector3(p.x, p.y, p.z);
    const offsetDir = new THREE.Vector3().subVectors(cam.position, oc.target).normalize();
    if (offsetDir.lengthSq() < 1e-6) offsetDir.set(0.55, 0.35, 0.75).normalize();
    const toPos = target.clone().add(offsetDir.multiplyScalar(6.5));
    toPos.y = Math.max(toPos.y, target.y + 1.6);
    cellAnimRef.current = {
      active: true,
      start: performance.now(),
      duration: 560,
      fromPos: cam.position.clone(),
      toPos,
      fromTarget: oc.target.clone(),
      toTarget: target,
    };
  }, [cellFocusToken, camera, orbitControlsRef, cellFocusTargetRef]);

  useFrame(() => {
    const a = cellAnimRef.current;
    if (!a?.active) return;
    const cam = camera as THREE.PerspectiveCamera;
    const oc = orbitControlsRef.current;
    if (!oc) return;
    const t = Math.min(1, (performance.now() - a.start) / a.duration);
    const e = 1 - Math.pow(1 - t, 3);
    cam.position.lerpVectors(a.fromPos, a.toPos, e);
    oc.target.lerpVectors(a.fromTarget, a.toTarget, e);
    oc.update();
    if (t >= 1) a.active = false;
  });

  return null;
}

function StoreObject({ store, isSelected, onSelect, mode }: { store: StoreType, isSelected: boolean, onSelect: () => void, mode: 'translate' | 'rotate' | 'scale' }) {
  const {
    updateStore,
    stores,
    blankets,
    searchQuery,
    selectedStore,
    gridFace,
    selectedGridCell,
    setSelectedGridCell,
    setSelectedStore,
  } = useStore();
  const { settings, requestFocusCellWorld } = useViewer3D();
  const groupRef = useRef<THREE.Group>(null!);
  const floatingRef = useRef<THREE.Group>(null!);
  const glowRef = useRef<THREE.MeshStandardMaterial>(null!);
  const arrowRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const [isColliding, setIsColliding] = useState(false);

  // Ensure dimensions are valid
  const width = store.width || 5;
  const depth = store.depth || 5;
  const height = store.height || 3;
  const storeColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test((store as any).store_color || '')
    ? (store as any).store_color
    : '#3b82f6';
  const storeOpacity = Math.min(1, Math.max(0.1, Number((store as any).store_opacity ?? 1) || 1));
  const overlayCellWidth = Math.min(
    20,
    Math.max(0.1, Number((store as any).cell_width ?? (STORE_LOCAL_FOOTPRINT_WIDTH / Math.max(1, store.columns))) || (STORE_LOCAL_FOOTPRINT_WIDTH / Math.max(1, store.columns)))
  );
  const overlayCellDepth = Math.min(
    20,
    Math.max(0.1, Number((store as any).cell_depth ?? (STORE_LOCAL_FOOTPRINT_DEPTH / Math.max(1, store.rows))) || (STORE_LOCAL_FOOTPRINT_DEPTH / Math.max(1, store.rows)))
  );
  const STORE_LOCAL_HIGHLIGHT_HEIGHT = 8;

  // Filter blankets for this store
  const storeBlankets = useMemo(() => 
    blankets.filter(b => b.store === store.store_name && b.status === 'stored'),
    [blankets, store.store_name]
  );

  const searchTargetFlats = useMemo(() => {
    const flats = new Set<number>();
    if (store.store_name !== selectedStore) return flats;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return flats;
    for (const b of storeBlankets) {
      if (b.blanket_number.toLowerCase() !== q) continue;
      if (b.row < 1 || b.row > store.rows || b.column < 1 || b.column > store.columns) continue;
      const flat = (b.row - 1) * store.columns + (b.column - 1);
      flats.add(flat);
    }
    return flats;
  }, [store.store_name, selectedStore, searchQuery, storeBlankets, store.rows, store.columns]);

  const hasSearchMatch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return false;
    return storeBlankets.some((b) => b.blanket_number.toLowerCase() === q);
  }, [searchQuery, storeBlankets]);

  // Sync state with transform controls
  const handleTransform = () => {
    if (!groupRef.current || isColliding) return;
    const { position, rotation, scale } = groupRef.current;
    
    // Calculate new store values
    const newHeight = scale.y * 3;
    updateStore(store.store_name, {
      position_x: position.x,
      position_y: position.y - (newHeight / 2),
      position_z: position.z,
      rotation_y: rotation.y,
      width: scale.x * STORE_LOCAL_FOOTPRINT_WIDTH,
      depth: scale.z * STORE_LOCAL_FOOTPRINT_DEPTH,
      height: newHeight,
    });
  };

  const resetTransform = () => {
    if (!groupRef.current) return;
    groupRef.current.position.set(store.position_x, store.position_y + (height / 2), store.position_z);
    groupRef.current.rotation.set(0, store.rotation_y, 0);
    groupRef.current.scale.set(width / STORE_LOCAL_FOOTPRINT_WIDTH, height / 3, depth / STORE_LOCAL_FOOTPRINT_DEPTH);
    setIsColliding(false);
  };

  // Pulsating effect for collision
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame((state) => {
    if (!materialRef.current) return;
    const t = state.clock.getElapsedTime();
    if (isColliding) {
      materialRef.current.emissiveIntensity = 0.5 + Math.sin(t * 10) * 0.4;
      materialRef.current.emissive.set('#ef4444');
      return;
    }

    if (hasSearchMatch) {
      materialRef.current.emissive.set(storeColor);
      materialRef.current.emissiveIntensity = 0.3 + (Math.sin(t * 8) * 0.2 + 0.2);
    } else {
      materialRef.current.emissive.set('#000000');
      materialRef.current.emissiveIntensity = isSelected || hovered ? 0.18 : 0.04;
    }

    if (floatingRef.current) {
      if (hasSearchMatch && !isSelected) {
        const bob = 0.12 + Math.sin(t * 4.2) * 0.08;
        const pulse = 1 + Math.sin(t * 6.4) * 0.012;
        floatingRef.current.position.y = bob;
        floatingRef.current.scale.set(pulse, pulse, pulse);
      } else {
        floatingRef.current.position.y = 0;
        floatingRef.current.scale.set(1, 1, 1);
      }
    }

    if (glowRef.current) {
      if (hasSearchMatch) {
        glowRef.current.opacity = 0.16 + (Math.sin(t * 6) * 0.05 + 0.05);
        glowRef.current.emissiveIntensity = 0.8 + (Math.sin(t * 5) * 0.2 + 0.2);
      } else {
        glowRef.current.opacity = 0;
        glowRef.current.emissiveIntensity = 0;
      }
    }

    if (arrowRef.current) {
      arrowRef.current.visible = hasSearchMatch;
      if (hasSearchMatch) {
        arrowRef.current.position.y = STORE_LOCAL_HIGHLIGHT_HEIGHT / 2 + 1.05 + Math.sin(t * 7) * 0.14;
        arrowRef.current.rotation.y = t * 2.2;
      }
    }
  });

  return (
    <>
      <group 
        ref={groupRef}
        position={[store.position_x, store.position_y + (height / 2), store.position_z]}
        rotation={[0, store.rotation_y, 0]}
        scale={[width / STORE_LOCAL_FOOTPRINT_WIDTH, height / 3, depth / STORE_LOCAL_FOOTPRINT_DEPTH]}
      >
        <group ref={floatingRef}>
          <mesh
            castShadow
            receiveShadow
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHovered(false);
              document.body.style.cursor = 'auto';
            }}
          >
            <boxGeometry args={[STORE_LOCAL_FOOTPRINT_WIDTH, STORE_LOCAL_HIGHLIGHT_HEIGHT, STORE_LOCAL_FOOTPRINT_DEPTH]} />
            <meshStandardMaterial
              ref={materialRef}
              color={storeColor}
              transparent
              opacity={storeOpacity}
              depthWrite={storeOpacity >= 0.999}
              roughness={0.55}
              metalness={0.06}
              emissive={isColliding ? '#ef4444' : '#000000'}
              emissiveIntensity={isSelected || hovered ? 0.18 : 0.04}
            />
            {(isSelected || hovered) && (
              <Outlines color={isSelected ? '#ffffff' : '#dbeafe'} thickness={isSelected ? 0.03 : 0.015} />
            )}
          </mesh>

          <mesh scale={[1.05, 1.02, 1.05]} renderOrder={5}>
            <boxGeometry args={[STORE_LOCAL_FOOTPRINT_WIDTH, STORE_LOCAL_HIGHLIGHT_HEIGHT, STORE_LOCAL_FOOTPRINT_DEPTH]} />
            <meshStandardMaterial
              ref={glowRef}
              color={storeColor}
              emissive={storeColor}
              emissiveIntensity={0}
              transparent
              opacity={0}
              depthWrite={false}
            />
          </mesh>

          <group ref={arrowRef} position={[0, STORE_LOCAL_HIGHLIGHT_HEIGHT / 2 + 1.05, 0]} visible={false}>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.38, 0.68, 20]} />
              <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1.05} />
            </mesh>
            <mesh position={[0, 0.42, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.46, 14]} />
              <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.75} />
            </mesh>
            <mesh position={[0, 0.82, 0]}>
              <torusGeometry args={[0.62, 0.07, 14, 36]} />
              <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.85} />
            </mesh>
            <Text
              position={[0, 1.2, 0]}
              fontSize={0.28}
              color="#fef08a"
              anchorX="center"
              anchorY="middle"
            >
              FOUND
            </Text>
          </group>
        </group>

        {settings.showStoreGridOverlay && (
          <VirtualBlanketGridOverlay
            storeName={store.store_name}
            storeRows={store.rows}
            storeCols={store.columns}
            cellWidth={overlayCellWidth}
            cellDepth={overlayCellDepth}
            slotCapacity={store.slot_capacity}
            storeBlankets={storeBlankets}
            searchTargetFlats={searchTargetFlats}
            gridFace={gridFace}
            selectedCell={selectedGridCell}
            storeSelected={selectedStore === store.store_name}
            searchQuery={searchQuery}
            searchMatch={searchTargetFlats.size > 0}
            onSelectCell={(cell) => {
              setSelectedStore(store.store_name);
              setSelectedGridCell({ store: store.store_name, row: cell.row, column: cell.column });
              requestFocusCellWorld({
                x: cell.position.x,
                y: cell.position.y,
                z: cell.position.z,
              });
            }}
          />
        )}
      </group>

      {isSelected && (
        <TransformControls 
          object={groupRef.current} 
          mode={mode}
          space={settings.transformSpace}
          showX={settings.transformShowX}
          showY={settings.transformShowY}
          showZ={settings.transformShowZ}
          translationSnap={settings.translationSnap > 0 ? settings.translationSnap : undefined}
          rotationSnap={settings.rotationSnapDeg > 0 ? (settings.rotationSnapDeg * Math.PI) / 180 : undefined}
          scaleSnap={settings.scaleSnap > 0 ? settings.scaleSnap : undefined}
          onChange={() => {
            if (!groupRef.current) return;
            const { position, rotation, scale } = groupRef.current;
            const currentData = {
              position_x: position.x,
              position_y: position.y - (scale.y * 3 / 2),
              position_z: position.z,
              rotation_y: rotation.y,
              width: scale.x * STORE_LOCAL_FOOTPRINT_WIDTH,
              depth: scale.z * STORE_LOCAL_FOOTPRINT_DEPTH,
              height: scale.y * 3,
            };
            
            const colliding = stores.some(other => {
              if (other.store_name === store.store_name) return false;
              return checkStoreCollision(currentData, other);
            });
            setIsColliding(colliding);
          }}
          onMouseUp={() => {
            if (isColliding) {
              resetTransform();
            } else {
              handleTransform();
            }
          }}
        />
      )}
    </>
  );
}

function getCanvasBackground(mode: import('../context/Viewer3DSettings').LightMode) {
  switch (mode) {
    case 'day':
      return '#f8fafc';
    case 'night':
      return '#020617';
    case 'bright':
      return '#0f172a';
    case 'very-dark':
      return '#000309';
    default:
      return '#111827';
  }
}

function getGridColors(mode: import('../context/Viewer3DSettings').LightMode) {
  switch (mode) {
    case 'day':
      return { sectionColor: '#cbd5e1', cellColor: '#e2e8f0' };
    case 'night':
      return { sectionColor: '#334155', cellColor: '#1e293b' };
    case 'bright':
      return { sectionColor: '#60a5fa', cellColor: '#c7d2fe' };
    case 'very-dark':
      return { sectionColor: '#0f172a', cellColor: '#020617' };
    default:
      return { sectionColor: '#3b82f6', cellColor: '#1e293b' };
  }
}

function getHemisphereLight(mode: import('../context/Viewer3DSettings').LightMode) {
  switch (mode) {
    case 'day':
      return { skyColor: '#ffffff', groundColor: '#cbd5e1', intensity: 0.5 };
    case 'night':
      return { skyColor: '#475569', groundColor: '#020617', intensity: 0.18 };
    case 'bright':
      return { skyColor: '#ffffff', groundColor: '#e2e8f0', intensity: 0.65 };
    case 'very-dark':
      return { skyColor: '#0f172a', groundColor: '#020617', intensity: 0.12 };
    default:
      return { skyColor: '#ffffff', groundColor: '#94a3b8', intensity: 0.35 };
  }
}

function Scene({ mode }: { mode: 'translate' | 'rotate' | 'scale' }) {
  const { stores, selectedStore, setSelectedStore } = useStore();
  const { settings, orbitControlsRef } = useViewer3D();
  const [dx, dy, dz] = settings.directionalPosition;
  const gridColors = useMemo(() => getGridColors(settings.lightMode), [settings.lightMode]);
  const hemisphere = useMemo(() => getHemisphereLight(settings.lightMode), [settings.lightMode]);
  const lighting = useMemo(() => {
    const base = {
      ambientIntensity: settings.ambientIntensity,
      directionalIntensity: settings.directionalIntensity,
      pointIntensity: settings.pointIntensity,
    };
    if (settings.lightMode === 'day') {
      return { ambientIntensity: 0.7, directionalIntensity: 1.5, pointIntensity: 0.45 };
    }
    if (settings.lightMode === 'night') {
      return { ambientIntensity: 0.14, directionalIntensity: 0.18, pointIntensity: 0.45 };
    }
    if (settings.lightMode === 'bright') {
      return { ambientIntensity: 1.1, directionalIntensity: 2.2, pointIntensity: 1.2 };
    }
    if (settings.lightMode === 'very-dark') {
      return { ambientIntensity: 0.05, directionalIntensity: 0.08, pointIntensity: 0.3 };
    }
    return base;
  }, [settings.lightMode, settings.ambientIntensity, settings.directionalIntensity, settings.pointIntensity]);

  return (
    <Suspense fallback={<Html center><div className="text-white font-black text-2xl animate-pulse uppercase tracking-tighter">Initializing 3D...</div></Html>}>
      <CameraAndFocusSync />
      <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={settings.cameraFov} />
      <OrbitControls
        ref={orbitControlsRef}
        makeDefault
        enabled={settings.orbitEnabled}
        minPolarAngle={settings.orbitMinPolar}
        maxPolarAngle={settings.orbitMaxPolar}
        minDistance={settings.orbitMinDistance}
        maxDistance={settings.orbitMaxDistance}
        enableDamping={settings.orbitEnableDamping}
        dampingFactor={settings.orbitDampingFactor}
      />
      
      <hemisphereLight
        color={hemisphere.skyColor}
        groundColor={hemisphere.groundColor}
        intensity={hemisphere.intensity}
      />
      <ambientLight intensity={lighting.ambientIntensity} />
      <directionalLight position={[dx, dy, dz]} intensity={lighting.directionalIntensity} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={lighting.pointIntensity} />
      
      {settings.gridVisible && (
        <Grid 
          infiniteGrid 
          fadeDistance={50} 
          fadeStrength={5} 
          cellSize={1} 
          sectionSize={5} 
          sectionColor={gridColors.sectionColor}
          cellColor={gridColors.cellColor}
        />
      )}

      {settings.showShopModel && (
        <ShopModel
          opacity={settings.shopOpacity}
          scale={settings.shopScale}
          position={settings.shopPosition}
          rotationY={settings.shopRotationY}
        />
      )}

      {settings.originMarkerVisible && (
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
        </mesh>
      )}

      {stores.map((store) => (
        <StoreObject 
          key={store.store_name} 
          store={store} 
          mode={mode}
          isSelected={selectedStore === store.store_name}
          onSelect={() => setSelectedStore(store.store_name)}
        />
      ))}
    </Suspense>
  );
}

function RowSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const display =
    typeof value === 'number' && Math.abs(value) < 10 && step < 0.1
      ? value.toFixed(2)
      : Number.isInteger(step) && step >= 1
        ? Math.round(value)
        : value.toFixed(2);
  return (
    <label className="flex flex-col gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
      <span className="flex justify-between gap-2">
        <span>{label}</span>
        <span className="text-slate-200 tabular-nums font-mono">{display}</span>
      </span>
      <input
        type="range"
        className="w-full accent-blue-500 h-1.5 rounded-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

function Viewer3DControlPanel() {
  const { settings, patchSettings, resetSettings, requestCameraReset, requestFocusSelectedStore } =
    useViewer3D();
  const { stores, selectedStore, updateStore } = useStore();
  const [open, setOpen] = useState(true);
  const [batchEdit, setBatchEdit] = useState(false);
  const selected = stores.find((s) => s.store_name === selectedStore);

  const patchStore = (partial: Partial<StoreType>) => {
    if (batchEdit) {
      stores.forEach((store) => updateStore(store.store_name, partial));
      return;
    }
    if (!selected) return;
    updateStore(selected.store_name, partial);
  };

  return (
    <div
      className={cn(
        'absolute z-20 flex flex-col bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden',
        open ? 'top-24 right-4 bottom-28 w-[min(100vw-2rem,340px)]' : 'top-24 right-4 w-12 h-12 rounded-xl'
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center gap-2 p-3 border-b border-slate-800 bg-slate-800/50 hover:bg-slate-800 shrink-0"
        title={open ? 'طي اللوحة' : 'خصائص المشهد ثلاثي الأبعاد'}
      >
        <SlidersHorizontal size={18} className="text-blue-400 shrink-0" />
        {open && (
          <span className="text-xs font-black text-white uppercase tracking-wider flex-1 text-right">
            تحكم كامل — 3D
          </span>
        )}
      </button>

      {open && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => requestCameraReset()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase text-slate-200 border border-slate-600"
            >
              <RotateCcw size={14} />
              إعادة الكاميرا
            </button>
            <button
              type="button"
              onClick={() => requestFocusSelectedStore()}
              disabled={!selectedStore}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 disabled:opacity-40 text-[10px] font-black uppercase text-white"
            >
              <Crosshair size={14} />
              تمركز على المخزن
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBatchEdit(false)}
              className={cn(
                'flex-1 py-2 rounded-xl text-[10px] font-black uppercase border',
                !batchEdit
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'
              )}
            >
              مخزن واحد
            </button>
            <button
              type="button"
              onClick={() => setBatchEdit(true)}
              className={cn(
                'flex-1 py-2 rounded-xl text-[10px] font-black uppercase border',
                batchEdit
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'
              )}
            >
              تحرير الكل
            </button>
          </div>

          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers size={14} />
              المشهد
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ['gridVisible', 'شبكة أرضية'],
                  ['originMarkerVisible', 'علامة الأصل'],
                  ['shadowsEnabled', 'ظلال'],
                  ['showShopModel', 'نموذج المحل'],
                  ['showStoreGridOverlay', 'شبكة المخزن'],
                  ['showBlanketMarkers', 'صناديق البطانيات'],
                  ['showStoreLabels', 'أسماء المخازن'],
                ] as const
              ).map(([key, ar]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-[11px] font-bold text-slate-300 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-600 accent-blue-500"
                    checked={settings[key]}
                    onChange={(e) => patchSettings({ [key]: e.target.checked })}
                  />
                  {ar}
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
              <Box size={14} />
              نموذج المحل
            </h4>
            <RowSlider
              label="شفافية"
              value={settings.shopOpacity}
              min={0.02}
              max={0.7}
              step={0.01}
              onChange={(v) => patchSettings({ shopOpacity: v })}
            />
            <RowSlider
              label="مقياس (GLB)"
              value={settings.shopScale}
              min={0.01}
              max={50}
              step={0.01}
              onChange={(v) => patchSettings({ shopScale: v })}
            />
            <div className="grid grid-cols-3 gap-2">
              {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                <label key={axis} className="text-[10px] font-bold text-slate-500 uppercase">
                  {axis}
                  <input
                    type="number"
                    step={0.1}
                    className="mt-1 w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                    value={settings.shopPosition[i]}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      const next: [number, number, number] = [...settings.shopPosition];
                      next[i] = v;
                      patchSettings({ shopPosition: next });
                    }}
                  />
                </label>
              ))}
            </div>
            <label className="text-[10px] font-bold text-slate-500 uppercase">
              دوران Y°
              <input
                type="number"
                step={1}
                className="mt-1 w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                value={Math.round((settings.shopRotationY * 180) / Math.PI)}
                onChange={(e) => {
                  const deg = parseFloat(e.target.value) || 0;
                  patchSettings({ shopRotationY: (deg * Math.PI) / 180 });
                }}
              />
            </label>
          </section>

          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sun size={14} />
              الإضاءة
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ['day', 'نهار'],
                  ['night', 'ليل'],
                  ['bright', 'ساطع'],
                  ['very-dark', 'مظلم شديد'],
                  ['custom', 'Custome'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    const presets: Record<string, Partial<typeof settings>> = {
                      day: { ambientIntensity: 0.7, directionalIntensity: 1.5, pointIntensity: 0.45, lightMode: 'day' },
                      night: { ambientIntensity: 0.14, directionalIntensity: 0.18, pointIntensity: 0.45, lightMode: 'night' },
                      bright: { ambientIntensity: 1.1, directionalIntensity: 2.2, pointIntensity: 1.2, lightMode: 'bright' },
                      'very-dark': { ambientIntensity: 0.05, directionalIntensity: 0.08, pointIntensity: 0.3, lightMode: 'very-dark' },
                      custom: { lightMode: 'custom' },
                    };
                    patchSettings(presets[value]);
                  }}
                  className={cn(
                    'py-2 rounded-xl text-[10px] font-black uppercase border',
                    settings.lightMode === value
                      ? 'bg-amber-500 border-amber-400 text-slate-950'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <RowSlider
              label="محيط (Ambient)"
              value={settings.ambientIntensity}
              min={0}
              max={2}
              step={0.05}
              onChange={(v) => patchSettings({ ambientIntensity: v, lightMode: 'custom' })}
            />
            <RowSlider
              label="اتجاهية"
              value={settings.directionalIntensity}
              min={0}
              max={4}
              step={0.05}
              onChange={(v) => patchSettings({ directionalIntensity: v, lightMode: 'custom' })}
            />
            <RowSlider
              label="نقطة خلفية"
              value={settings.pointIntensity}
              min={0}
              max={3}
              step={0.05}
              onChange={(v) => patchSettings({ pointIntensity: v, lightMode: 'custom' })}
            />
            <div className="grid grid-cols-3 gap-2">
              {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                <label key={axis} className="text-[10px] font-bold text-slate-500 uppercase">
                  ضوء {axis}
                  <input
                    type="number"
                    step={0.5}
                    className="mt-1 w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                    value={settings.directionalPosition[i]}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      const next: [number, number, number] = [...settings.directionalPosition];
                      next[i] = v;
                      patchSettings({ directionalPosition: next });
                    }}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
              <Video size={14} />
              الكاميرا والمدار
            </h4>
            <RowSlider
              label="مجال الرؤية FOV"
              value={settings.cameraFov}
              min={25}
              max={90}
              step={1}
              onChange={(v) => patchSettings({ cameraFov: v })}
            />
            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-600 accent-blue-500"
                checked={settings.orbitEnabled}
                onChange={(e) => patchSettings({ orbitEnabled: e.target.checked })}
              />
              تفعيل المدار (Orbit)
            </label>
            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-slate-600 accent-blue-500"
                checked={settings.orbitEnableDamping}
                onChange={(e) => patchSettings({ orbitEnableDamping: e.target.checked })}
              />
              تخميد الحركة
            </label>
            <RowSlider
              label="معامل التخميد"
              value={settings.orbitDampingFactor}
              min={0.01}
              max={0.2}
              step={0.01}
              onChange={(v) => patchSettings({ orbitDampingFactor: v })}
            />
            <RowSlider
              label="أدنى مسافة تكبير"
              value={settings.orbitMinDistance}
              min={1}
              max={80}
              step={1}
              onChange={(v) => patchSettings({ orbitMinDistance: v })}
            />
            <RowSlider
              label="أقصى مسافة تكبير"
              value={settings.orbitMaxDistance}
              min={20}
              max={800}
              step={10}
              onChange={(v) => patchSettings({ orbitMaxDistance: v })}
            />
            <RowSlider
              label="حد قطبي أدنى (°)"
              value={(settings.orbitMinPolar * 180) / Math.PI}
              min={0}
              max={90}
              step={1}
              onChange={(v) => patchSettings({ orbitMinPolar: (v * Math.PI) / 180 })}
            />
            <RowSlider
              label="حد قطبي أقصى (°)"
              value={(settings.orbitMaxPolar * 180) / Math.PI}
              min={0}
              max={90}
              step={1}
              onChange={(v) => patchSettings({ orbitMaxPolar: (v * Math.PI) / 180 })}
            />
          </section>

          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
              <Box size={14} />
              أداة التحويل (Gizmo)
            </h4>
            <div className="flex gap-2">
              {(
                [
                  ['world', 'عالمي'],
                  ['local', 'محلي'],
                ] as const
              ).map(([val, ar]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => patchSettings({ transformSpace: val })}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-[10px] font-black uppercase border',
                    settings.transformSpace === val
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'
                  )}
                >
                  {ar}
                </button>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              {(
                [
                  ['transformShowX', 'X'],
                  ['transformShowY', 'Y'],
                  ['transformShowZ', 'Z'],
                ] as const
              ).map(([key, lab]) => (
                <label
                  key={key}
                  className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase"
                >
                  <input
                    type="checkbox"
                    className="rounded border-slate-600 accent-violet-500"
                    checked={settings[key]}
                    onChange={(e) => patchSettings({ [key]: e.target.checked })}
                  />
                  {lab}
                </label>
              ))}
            </div>
            <RowSlider
              label="تثبيت انتقال (0=معطل)"
              value={settings.translationSnap}
              min={0}
              max={1}
              step={0.05}
              onChange={(v) => patchSettings({ translationSnap: v })}
            />
            <RowSlider
              label="تثبيت دوران (°)"
              value={settings.rotationSnapDeg}
              min={0}
              max={45}
              step={1}
              onChange={(v) => patchSettings({ rotationSnapDeg: v })}
            />
            <RowSlider
              label="تثبيت مقياس (0=معطل)"
              value={settings.scaleSnap}
              min={0}
              max={0.5}
              step={0.01}
              onChange={(v) => patchSettings({ scaleSnap: v })}
            />
          </section>

          <section className="space-y-3">
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
              النموذج المحدد
            </h4>
            {!selected ? (
              <p className="text-xs text-slate-500 font-bold">اضغط على مخزن في المشهد لتحرير القيم.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-black text-white truncate">{selected.store_name}</p>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase col-span-1">
                    Pos X
                    <input
                      type="number"
                      step={0.1}
                      className="mt-0.5 w-full px-1.5 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                      value={Number(selected.position_x.toFixed(3))}
                      onChange={(e) => patchStore({ position_x: parseFloat(e.target.value) || 0 })}
                    />
                  </label>
                  <label className="text-[9px] font-bold text-slate-500 uppercase col-span-1">
                    Pos Y
                    <input
                      type="number"
                      step={0.1}
                      className="mt-0.5 w-full px-1.5 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                      value={Number(selected.position_y.toFixed(3))}
                      onChange={(e) => patchStore({ position_y: parseFloat(e.target.value) || 0 })}
                    />
                  </label>
                  <label className="text-[9px] font-bold text-slate-500 uppercase col-span-1">
                    Pos Z
                    <input
                      type="number"
                      step={0.1}
                      className="mt-0.5 w-full px-1.5 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                      value={Number(selected.position_z.toFixed(3))}
                      onChange={(e) => patchStore({ position_z: parseFloat(e.target.value) || 0 })}
                    />
                  </label>
                </div>
                <label className="text-[9px] font-bold text-slate-500 uppercase block">
                  دوران Y (درجات)
                  <input
                    type="number"
                    step={1}
                    className="mt-0.5 w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                    value={Math.round((selected.rotation_y * 180) / Math.PI)}
                    onChange={(e) =>
                      patchStore({ rotation_y: ((parseFloat(e.target.value) || 0) * Math.PI) / 180 })
                    }
                  />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">
                    عرض
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      className="mt-0.5 w-full px-1.5 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                      value={Number(selected.width.toFixed(2))}
                      onChange={(e) => patchStore({ width: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                    />
                  </label>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">
                    عمق
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      className="mt-0.5 w-full px-1.5 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                      value={Number(selected.depth.toFixed(2))}
                      onChange={(e) => patchStore({ depth: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                    />
                  </label>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">
                    ارتفاع
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      className="mt-0.5 w-full px-1.5 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                      value={Number(selected.height.toFixed(2))}
                      onChange={(e) => patchStore({ height: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">
                    Cell W
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      max={20}
                      className="mt-0.5 w-full px-1.5 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                      value={Number((Math.min(20, Math.max(0.1, Number((selected as any).cell_width ?? (STORE_LOCAL_FOOTPRINT_WIDTH / Math.max(1, selected.columns))) || (STORE_LOCAL_FOOTPRINT_WIDTH / Math.max(1, selected.columns))))).toFixed(2))}
                      onChange={(e) =>
                        patchStore({
                          cell_width: Math.min(20, Math.max(0.1, parseFloat(e.target.value) || 0.1)),
                        } as Partial<StoreType>)
                      }
                    />
                  </label>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">
                    Cell D
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      max={20}
                      className="mt-0.5 w-full px-1.5 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                      value={Number((Math.min(20, Math.max(0.1, Number((selected as any).cell_depth ?? (STORE_LOCAL_FOOTPRINT_DEPTH / Math.max(1, selected.rows))) || (STORE_LOCAL_FOOTPRINT_DEPTH / Math.max(1, selected.rows))))).toFixed(2))}
                      onChange={(e) =>
                        patchStore({
                          cell_depth: Math.min(20, Math.max(0.1, parseFloat(e.target.value) || 0.1)),
                        } as Partial<StoreType>)
                      }
                    />
                  </label>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">
                    لون المخزن
                    <input
                      type="color"
                      className="mt-0.5 w-full h-8 rounded-lg bg-slate-800 border border-slate-600"
                      value={
                        /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test((selected as any).store_color || '')
                          ? (selected as any).store_color
                          : '#3b82f6'
                      }
                      onChange={(e) => patchStore({ store_color: e.target.value } as Partial<StoreType>)}
                    />
                  </label>
                  <label className="text-[9px] font-bold text-slate-500 uppercase">
                    الشفافية
                    <input
                      type="number"
                      min={0.1}
                      max={1}
                      step={0.05}
                      className="mt-0.5 w-full px-1.5 py-1 rounded-lg bg-slate-800 border border-slate-600 text-white text-xs font-mono"
                      value={Number((Math.min(1, Math.max(0.1, Number((selected as any).store_opacity ?? 1) || 1))).toFixed(2))}
                      onChange={(e) =>
                        patchStore({
                          store_opacity: Math.min(1, Math.max(0.1, parseFloat(e.target.value) || 1)),
                        } as Partial<StoreType>)
                      }
                    />
                  </label>
                </div>
              </div>
            )}
          </section>

          <button
            type="button"
            onClick={() => resetSettings()}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase text-slate-300 border border-slate-600"
          >
            إعادة ضبط خصائص المشهد
          </button>
        </div>
      )}
    </div>
  );
}

function StoreQuickPopup() {
  const {
    stores,
    blankets,
    selectedStore,
    selectedGridCell,
    setSelectedGridCell,
    setSelectedStore,
    addBlanket,
    markAsPicked,
    currentUser,
  } = useStore();

  const selected = useMemo(
    () => stores.find((s) => s.store_name === selectedStore) ?? null,
    [stores, selectedStore]
  );

  const [newNumber, setNewNumber] = useState('');
  const [busy, setBusy] = useState(false);
  const [pickingId, setPickingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNewNumber('');
    setError(null);
  }, [selected?.store_name]);

  const slotCapacity = useMemo(() => {
    if (!selected) return 1;
    if (selected.store_type === 'hanger') return 1;
    return Math.max(1, Number((selected as any).slot_capacity ?? 1));
  }, [selected]);

  const storedInStore = useMemo(() => {
    if (!selected) return [] as Blanket[];
    return blankets.filter((b) => b.store === selected.store_name && b.status === 'stored');
  }, [blankets, selected]);

  const cellItemsMap = useMemo(() => {
    const map = new Map<string, Blanket[]>();
    for (const b of storedInStore) {
      const key = `${b.row},${b.column}`;
      const list = map.get(key);
      if (list) {
        list.push(b);
      } else {
        map.set(key, [b]);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return map;
  }, [storedInStore]);

  const firstAvailableCell = useMemo(() => {
    if (!selected) return null;
    for (let r = 1; r <= selected.rows; r += 1) {
      for (let c = selected.columns; c >= 1; c -= 1) {
        const count = cellItemsMap.get(`${r},${c}`)?.length ?? 0;
        if (count < slotCapacity) return { row: r, column: c };
      }
    }
    return null;
  }, [selected, cellItemsMap, slotCapacity]);

  const activeCell = useMemo(() => {
    if (!selected) return null;
    if (selectedGridCell && selectedGridCell.store === selected.store_name) {
      return { row: selectedGridCell.row, column: selectedGridCell.column };
    }
    return null;
  }, [selected, selectedGridCell]);

  useEffect(() => {
    if (!selected) return;
    if (activeCell) return;
    const fallback = firstAvailableCell ?? { row: 1, column: selected.columns };
    setSelectedGridCell({ store: selected.store_name, row: fallback.row, column: fallback.column });
  }, [selected, activeCell, firstAvailableCell, setSelectedGridCell]);

  const selectedCell = activeCell ?? firstAvailableCell;
  const selectedCellKey = selectedCell ? `${selectedCell.row},${selectedCell.column}` : null;
  const selectedCellItems = selectedCellKey ? cellItemsMap.get(selectedCellKey) ?? [] : [];
  const selectedCellCount = selectedCellItems.length;
  const selectedCellFull = selectedCellCount >= slotCapacity;

  const handleStoreBlanket = async () => {
    if (!selected || !selectedCell) return;
    const value = newNumber.trim();
    if (!value) {
      setError('Enter blanket number first.');
      return;
    }
    if (selectedCellFull) {
      setError('Selected cell is full.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await addBlanket({
        blanket_number: value,
        store: selected.store_name,
        row: selectedCell.row,
        column: selectedCell.column,
        status: 'stored',
      });
      setNewNumber('');
    } catch (err: any) {
      setError(err?.message || 'Failed to store blanket.');
    } finally {
      setBusy(false);
    }
  };

  const handlePicked = async (blanket: Blanket) => {
    setPickingId(blanket.id);
    setError(null);
    try {
      await markAsPicked(blanket);
    } catch (err: any) {
      setError(err?.message || 'Failed to mark as picked.');
    } finally {
      setPickingId(null);
    }
  };

  if (!selected) return null;

  return (
    <div className="absolute top-24 left-6 z-20 w-[min(92vw,420px)] max-h-[calc(100vh-8rem)] pointer-events-auto">
      <div className="h-full bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Store Popup</div>
            <div className="text-sm font-black text-white">{selected.store_name}</div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedStore(null)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Close popup"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-auto">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-500">Grid Matrix</span>
              <span className="text-slate-400">
                {selected.rows}R × {selected.columns}C
              </span>
            </div>
            <div className="max-h-52 overflow-auto rounded-xl border border-slate-800 p-2 bg-slate-950">
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${selected.columns}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: selected.rows }).flatMap((_, rIdx) =>
                  Array.from({ length: selected.columns }).map((_, cIdx) => {
                    // Match visual Y direction with the 3D scene:
                    // top row in popup should target the top row seen in scene.
                    const row = selected.rows - rIdx;
                    const col = selected.columns - cIdx;
                    const key = `${row},${col}`;
                    const count = cellItemsMap.get(key)?.length ?? 0;
                    const isSelected = selectedCell?.row === row && selectedCell?.column === col;
                    const isFull = count >= slotCapacity;

                    return (
                      <button
                        key={`popup-cell-${key}`}
                        type="button"
                        onClick={() => setSelectedGridCell({ store: selected.store_name, row, column: col })}
                        className={cn(
                          'h-8 rounded-lg text-[10px] font-black tabular-nums transition-all border',
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-300 shadow-lg shadow-emerald-600/30'
                            : count > 0
                              ? isFull
                                ? 'bg-rose-900/40 text-rose-300 border-rose-800/80'
                                : 'bg-blue-900/35 text-blue-200 border-blue-800/70'
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600'
                        )}
                        title={`R${row}, C${col}`}
                      >
                        {count > 0 ? `${count}` : '·'}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-black text-white">
              <span>
                Selected: {selectedCell ? `R${selectedCell.row} · C${selectedCell.column}` : '—'}
              </span>
              <span className={cn('text-xs', selectedCellFull ? 'text-rose-400' : 'text-emerald-400')}>
                {selectedCellCount}/{slotCapacity}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="Blanket number..."
                className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white font-bold outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleStoreBlanket}
                disabled={busy || !selectedCell || selectedCellFull || !newNumber.trim() || !currentUser}
                className={cn(
                  'px-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-1.5',
                  busy || !selectedCell || selectedCellFull || !newNumber.trim() || !currentUser
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                )}
              >
                <Plus size={14} />
                Store
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cell Contents</div>
              {selectedCellItems.length === 0 ? (
                <div className="text-xs text-slate-500 font-semibold">This cell is empty.</div>
              ) : (
                <div className="max-h-40 overflow-auto space-y-1.5 pr-1">
                  {selectedCellItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-black text-white truncate">#{item.blanket_number}</div>
                        <div className="text-[10px] text-slate-500 font-bold">
                          {new Date(item.created_at).toLocaleString()}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePicked(item)}
                        disabled={pickingId === item.id || !currentUser}
                        className={cn(
                          'px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1',
                          pickingId === item.id || !currentUser
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        )}
                      >
                        <Check size={12} />
                        Picked
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-rose-900/60 bg-rose-900/20 px-3 py-2 text-xs font-bold text-rose-300">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Warehouse3DInner() {
  const { stores = [] } = useStore();
  const { settings } = useViewer3D();
  const [mode, setMode] = useState<'translate' | 'rotate' | 'scale'>('translate');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't') setMode('translate');
      if (e.key.toLowerCase() === 'r') setMode('rotate');
      if (e.key.toLowerCase() === 's') setMode('scale');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-full w-full relative group bg-slate-950">
      <Canvas 
        shadows={settings.shadowsEnabled}
        dpr={[1, 2]}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: getCanvasBackground(settings.lightMode) }}
      >
        <Scene mode={mode} />
      </Canvas>

      <Viewer3DControlPanel />
      <StoreQuickPopup />

      {stores.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl border border-slate-700 shadow-2xl text-center space-y-2">
            <Package size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">No Stores Found</h3>
            <p className="text-slate-400 text-sm max-w-[200px]">Add stores in the Management tab to see them in 3D.</p>
          </div>
        </div>
      )}

      {/* Mode Selector Toolbar */}
      <div className="absolute top-32 left-8 flex flex-col gap-2 z-10">
        <div className="bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-2xl flex flex-col gap-1">
          <button 
            onClick={() => setMode('translate')}
            className={cn(
              "p-3 rounded-xl transition-all flex items-center gap-3 group/btn",
              mode === 'translate' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40" : "hover:bg-slate-800 text-slate-400 hover:text-white"
            )}
            title="Move (T)"
          >
            <Move size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block pr-2">Move</span>
          </button>
          <button 
            onClick={() => setMode('rotate')}
            className={cn(
              "p-3 rounded-xl transition-all flex items-center gap-3 group/btn",
              mode === 'rotate' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40" : "hover:bg-slate-800 text-slate-400 hover:text-white"
            )}
            title="Rotate (R)"
          >
            <RotateCw size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block pr-2">Rotate</span>
          </button>
          <button 
            onClick={() => setMode('scale')}
            className={cn(
              "p-3 rounded-xl transition-all flex items-center gap-3 group/btn",
              mode === 'scale' ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40" : "hover:bg-slate-800 text-slate-400 hover:text-white"
            )}
            title="Scale (S)"
          >
            <Maximize size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover:block pr-2">Scale</span>
          </button>
        </div>
      </div>

      {/* Controls Help Overlay */}
      <div className="absolute bottom-24 right-8 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest">Editor Controls</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-bold text-slate-400 uppercase">Move</span>
            <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-black text-white">T</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-bold text-slate-400 uppercase">Rotate</span>
            <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-black text-white">R</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-bold text-slate-400 uppercase">Scale</span>
            <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-black text-white">S</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs font-bold text-slate-400 uppercase">Select</span>
            <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-black text-white">CLICK</span>
          </div>
        </div>
      </div>

      {/* Selection Info Overlay */}
      <div className="absolute top-8 left-8 pointer-events-none flex flex-col gap-4">
        <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-2xl flex items-center gap-6 animate-in slide-in-from-left duration-500">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-900/40">
            3D
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tighter text-white uppercase">Interactive Editor</h3>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Game-like Warehouse Management</p>
          </div>
        </div>
        
        {/* Debug Info */}
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-3 self-start">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            {stores.length} Stores Loaded
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Warehouse3D() {
  return <Warehouse3DInner />;
}

useGLTF.preload('/models/shop.glb');
