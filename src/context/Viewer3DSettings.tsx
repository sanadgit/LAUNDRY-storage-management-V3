import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type MutableRefObject,
} from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export type TransformSpace = 'world' | 'local';

export type LightMode = 'day' | 'night' | 'bright' | 'very-dark' | 'custom';

export type ViewerSettings = {
  ambientIntensity: number;
  directionalIntensity: number;
  directionalPosition: [number, number, number];
  pointIntensity: number;
  lightMode: LightMode;
  gridVisible: boolean;
  originMarkerVisible: boolean;
  shadowsEnabled: boolean;
  orbitEnabled: boolean;
  orbitMinDistance: number;
  orbitMaxDistance: number;
  orbitMinPolar: number;
  orbitMaxPolar: number;
  orbitEnableDamping: boolean;
  orbitDampingFactor: number;
  cameraFov: number;
  showStoreGridOverlay: boolean;
  showBlanketMarkers: boolean;
  showStoreLabels: boolean;
  showShopModel: boolean;
  shopOpacity: number;
  shopScale: number;
  shopPosition: [number, number, number];
  shopRotationY: number;
  transformSpace: TransformSpace;
  translationSnap: number;
  rotationSnapDeg: number;
  scaleSnap: number;
  transformShowX: boolean;
  transformShowY: boolean;
  transformShowZ: boolean;
};

export const defaultViewerSettings: ViewerSettings = {
  ambientIntensity: 0.7,
  directionalIntensity: 1.5,
  directionalPosition: [10, 10, 10],
  pointIntensity: 0.5,
  lightMode: 'day',
  gridVisible: true,
  originMarkerVisible: true,
  shadowsEnabled: true,
  orbitEnabled: true,
  orbitMinDistance: 4,
  orbitMaxDistance: 400,
  orbitMinPolar: 0,
  orbitMaxPolar: Math.PI / 2.05,
  orbitEnableDamping: true,
  orbitDampingFactor: 0.05,
  cameraFov: 50,
  showStoreGridOverlay: true,
  showBlanketMarkers: true,
  showStoreLabels: true,
  showShopModel: true,
  shopOpacity: 0.18,
  // Treat the 3D world units as meters. If the GLB was authored in centimeters,
  // use the control panel to set scale to 0.01. (Many exports are already meters.)
  shopScale: 2.63,
  shopPosition: [-10.4, 0, -3],
  shopRotationY: 0,
  transformSpace: 'world',
  translationSnap: 0,
  rotationSnapDeg: 0,
  scaleSnap: 0,
  transformShowX: true,
  transformShowY: true,
  transformShowZ: true,
};

const VIEWER_SETTINGS_STORAGE_KEY = 'viewer3dSettings:v2';

const safeParseJson = (raw: string | null) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const sanitizeViewerSettings = (raw: any): Partial<ViewerSettings> => {
  const partial: Partial<ViewerSettings> = {};

  for (const key of Object.keys(defaultViewerSettings) as Array<keyof ViewerSettings>) {
    const defValue = defaultViewerSettings[key];
    const rawValue = raw?.[key];

    if (Array.isArray(defValue)) {
      if (
        Array.isArray(rawValue) &&
        rawValue.length === defValue.length &&
        rawValue.every((n: any) => typeof n === 'number' && Number.isFinite(n))
      ) {
        (partial as any)[key] = rawValue;
      }
      continue;
    }

    if (typeof defValue === 'number') {
      if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
        (partial as any)[key] = rawValue;
      }
      continue;
    }

    if (typeof defValue === 'boolean') {
      if (typeof rawValue === 'boolean') {
        (partial as any)[key] = rawValue;
      }
      continue;
    }

    if (typeof defValue === 'string') {
      if (typeof rawValue === 'string') {
        (partial as any)[key] = rawValue;
      }
    }
  }

  if (typeof partial.shopOpacity === 'number') {
    partial.shopOpacity = Math.min(0.7, Math.max(0.02, partial.shopOpacity));
  }

  if (typeof partial.shopScale === 'number') {
    partial.shopScale = Math.min(100, Math.max(0.001, partial.shopScale));
  }

  return partial;
};

const loadInitialViewerSettings = (): ViewerSettings => {
  if (typeof window === 'undefined') return { ...defaultViewerSettings };
  const raw = safeParseJson(window.localStorage.getItem(VIEWER_SETTINGS_STORAGE_KEY));
  if (!raw) return { ...defaultViewerSettings };
  return { ...defaultViewerSettings, ...sanitizeViewerSettings(raw) };
};

type Viewer3DContextValue = {
  settings: ViewerSettings;
  patchSettings: (partial: Partial<ViewerSettings>) => void;
  resetSettings: () => void;
  orbitControlsRef: RefObject<OrbitControlsImpl | null>;
  cameraResetToken: number;
  requestCameraReset: () => void;
  focusSelectedToken: number;
  requestFocusSelectedStore: () => void;
  cellFocusToken: number;
  requestFocusCellWorld: (point: { x: number; y: number; z: number }) => void;
  cellFocusTargetRef: MutableRefObject<{ x: number; y: number; z: number } | null>;
};

const Viewer3DContext = createContext<Viewer3DContextValue | null>(null);

export function Viewer3DSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ViewerSettings>(() => loadInitialViewerSettings());
  const [cameraResetToken, setCameraResetToken] = useState(0);
  const [focusSelectedToken, setFocusSelectedToken] = useState(0);
  const [cellFocusToken, setCellFocusToken] = useState(0);
  const cellFocusTargetRef = useRef<{ x: number; y: number; z: number } | null>(null);

  const orbitControlsRef = useRef<OrbitControlsImpl | null>(null);

  const patchSettings = useCallback((partial: Partial<ViewerSettings>) => {
    setSettings((s) => ({ ...s, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...defaultViewerSettings });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(VIEWER_SETTINGS_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(VIEWER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage quota / privacy mode errors.
    }
  }, [settings]);

  const requestCameraReset = useCallback(() => {
    setCameraResetToken((t) => t + 1);
  }, []);

  const requestFocusSelectedStore = useCallback(() => {
    setFocusSelectedToken((t) => t + 1);
  }, []);

  const requestFocusCellWorld = useCallback((point: { x: number; y: number; z: number }) => {
    cellFocusTargetRef.current = point;
    setCellFocusToken((t) => t + 1);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      patchSettings,
      resetSettings,
      orbitControlsRef,
      cameraResetToken,
      requestCameraReset,
      focusSelectedToken,
      requestFocusSelectedStore,
      cellFocusToken,
      requestFocusCellWorld,
      cellFocusTargetRef,
    }),
    [
      settings,
      patchSettings,
      resetSettings,
      cameraResetToken,
      requestCameraReset,
      focusSelectedToken,
      requestFocusSelectedStore,
      cellFocusToken,
      requestFocusCellWorld,
    ]
  );

  return <Viewer3DContext.Provider value={value}>{children}</Viewer3DContext.Provider>;
}

export function useViewer3D() {
  const ctx = useContext(Viewer3DContext);
  if (!ctx) throw new Error('useViewer3D must be used within Viewer3DSettingsProvider');
  return ctx;
}
