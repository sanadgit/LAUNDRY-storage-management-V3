import {
  BrowserMultiFormatReader,
  type IScannerControls,
} from '@zxing/browser';
import {
  BarcodeFormat,
  ChecksumException,
  DecodeHintType,
  FormatException,
  NotFoundException,
} from '@zxing/library';

type StartScannerOptions = {
  videoElement: HTMLVideoElement;
  onDetected: (rawValue: string) => void;
  onRuntimeError?: (error: unknown) => void;
};

export type CameraScannerSession = {
  stop: () => void;
};

const SCAN_HINTS = new Map<DecodeHintType, unknown>([
  [
    DecodeHintType.POSSIBLE_FORMATS,
    [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.ITF,
      BarcodeFormat.CODABAR,
    ],
  ],
]);

function isIgnorableFrameError(error: unknown) {
  return (
    error instanceof NotFoundException ||
    error instanceof ChecksumException ||
    error instanceof FormatException
  );
}

export async function startCameraBarcodeScanner({
  videoElement,
  onDetected,
  onRuntimeError,
}: StartScannerOptions): Promise<CameraScannerSession> {
  if (!navigator?.mediaDevices?.getUserMedia) {
    throw new Error('Camera API is not available on this device/browser.');
  }

  const reader = new BrowserMultiFormatReader(SCAN_HINTS, {
    delayBetweenScanAttempts: 120,
    delayBetweenScanSuccess: 500,
    tryPlayVideoTimeout: 8000,
  });

  let controls: IScannerControls | null = null;
  let stopped = false;
  let runtimeErrorReported = false;

  controls = await reader.decodeFromConstraints(
    {
      audio: false,
      video: {
        facingMode: { ideal: 'environment' },
      },
    },
    videoElement,
    (result, error) => {
      if (stopped) return;

      if (result) {
        const text = result.getText?.().trim();
        if (text) onDetected(text);
        return;
      }

      if (!error || isIgnorableFrameError(error) || runtimeErrorReported) {
        return;
      }

      runtimeErrorReported = true;
      onRuntimeError?.(error);
    }
  );

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      controls?.stop();
      controls = null;
    },
  };
}

export function getScannerSupportMessage(error: unknown) {
  const fallback =
    'Could not start camera scanner. Ensure camera permission is allowed and page is served over HTTPS/localhost.';
  const message = typeof (error as any)?.message === 'string' ? (error as any).message : '';
  const name = String((error as any)?.name || '');

  if (name === 'NotAllowedError' || /permission/i.test(message)) {
    return 'Camera permission denied. Allow camera access in browser settings, then try again.';
  }

  if (name === 'NotFoundError' || /not found|no camera/i.test(message)) {
    return 'No camera device found.';
  }

  if (name === 'NotReadableError' || /in use|busy/i.test(message)) {
    return 'Camera is busy in another app/tab. Close it and retry.';
  }

  if (/secure context|https|localhost/i.test(message)) {
    return 'Camera requires HTTPS (or localhost). Open the app in a secure URL.';
  }

  return message || fallback;
}
