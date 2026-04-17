import * as THREE from 'three';

/**
 * أدوات لربط خلية منطقية بـ mesh في GLB عندما يُصدَّر الموديل كـ 120 كائنًا مُسَمًّى (Cell_1 …).
 * ملف storeB.glb الحالي: 3 شبكات مدمجة فقط — التمييز البصري للموضع يُنفَّذ في التطبيق عبر
 * InteractiveStorageMatrix وليس عبر هذه الدوال.
 */
export const STORE_MODEL_CELL_COUNT = 120;

export type CellMeshList = (THREE.Mesh | null)[];

export function parseMeshCellIndex(name: string): number | null {
  const trimmed = name.trim();
  const patterns = [
    /(?:cell|position|pos|slot)[\s._-]*(\d+)/i,
    /^(\d{1,3})$/,
    /\.(\d{1,4})$/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 1 && n <= STORE_MODEL_CELL_COUNT) return n;
    }
  }
  return null;
}

function localCenter(mesh: THREE.Mesh): THREE.Vector3 {
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
  return mesh.geometry.boundingBox!.getCenter(new THREE.Vector3());
}

/**
 * مصفوفة طولها 120: العنصر [i] هو mesh الخلية رقم (i+1) في التخطيط row-major مع المخزن.
 */
export function extractStoreCellMeshes(modelRoot: THREE.Object3D): CellMeshList {
  const slots: CellMeshList = Array(STORE_MODEL_CELL_COUNT).fill(null);

  const indexed: { mesh: THREE.Mesh; index: number }[] = [];
  modelRoot.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const idx = parseMeshCellIndex(obj.name);
    if (idx !== null) indexed.push({ mesh: obj, index: idx });
  });

  const byIdx = new Map<number, THREE.Mesh>();
  for (const { mesh, index } of indexed) {
    if (index >= 1 && index <= STORE_MODEL_CELL_COUNT && !byIdx.has(index)) {
      byIdx.set(index, mesh);
    }
  }

  if (byIdx.size === STORE_MODEL_CELL_COUNT) {
    return Array.from({ length: STORE_MODEL_CELL_COUNT }, (_, i) => byIdx.get(i + 1)!);
  }

  for (let i = 1; i <= STORE_MODEL_CELL_COUNT; i++) {
    const m = byIdx.get(i);
    if (m) slots[i - 1] = m;
  }
  if (byIdx.size > 0) {
    return slots;
  }

  const all: THREE.Mesh[] = [];
  modelRoot.traverse((obj) => {
    if (obj instanceof THREE.Mesh) all.push(obj);
  });

  if (all.length === STORE_MODEL_CELL_COUNT) {
    all.sort((a, b) => {
      const ca = localCenter(a);
      const cb = localCenter(b);
      const step = 0.2;
      const ra = Math.round(ca.z / step);
      const rb = Math.round(cb.z / step);
      if (ra !== rb) return ra - rb;
      return ca.x - cb.x;
    });
    return all;
  }

  return slots;
}

type MatBackup = { color: THREE.Color; emissive: THREE.Color; emissiveIntensity: number };

function isStandardLike(mat: THREE.Material): mat is THREE.MeshStandardMaterial {
  return 'color' in mat && 'emissive' in mat && 'emissiveIntensity' in mat;
}

export function ensureSearchMaterialBackup(mesh: THREE.Mesh): void {
  if (mesh.userData._searchMatBackup) return;
  const raw = mesh.material;
  const mats = Array.isArray(raw) ? [...raw] : [raw];
  const backup: (MatBackup | null)[] = [];
  const clones: THREE.Material[] = mats.map((m) => {
    if (!isStandardLike(m)) {
      backup.push(null);
      return m;
    }
    backup.push({
      color: m.color.clone(),
      emissive: m.emissive.clone(),
      emissiveIntensity: m.emissiveIntensity,
    });
    return m.clone();
  });
  if (!backup.some(Boolean)) return;
  mesh.userData._searchMatBackup = backup;
  mesh.material = Array.isArray(raw) ? clones : clones[0];
}

export function applyCellSearchHighlight(mesh: THREE.Mesh, highlight: boolean): void {
  const backup = mesh.userData._searchMatBackup as (MatBackup | null)[] | undefined;
  if (!backup) return;
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach((mat, i) => {
    const b = backup[i];
    if (!b || !isStandardLike(mat)) return;
    if (highlight) {
      mat.color.set('#4ade80');
      mat.emissive.set('#15803d');
      mat.emissiveIntensity = 1.1;
    } else {
      mat.color.copy(b.color);
      mat.emissive.copy(b.emissive);
      mat.emissiveIntensity = b.emissiveIntensity;
    }
  });
}
