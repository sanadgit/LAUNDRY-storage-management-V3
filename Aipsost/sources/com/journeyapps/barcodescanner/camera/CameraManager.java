package com.journeyapps.barcodescanner.camera;

import android.content.Context;
import android.hardware.Camera;
import android.os.Build;
import android.util.Log;
import android.view.SurfaceHolder;
import com.google.zxing.client.android.AmbientLightManager;
import com.google.zxing.client.android.camera.CameraConfigurationUtils;
import com.google.zxing.client.android.camera.open.OpenCameraInterface;
import com.journeyapps.barcodescanner.Size;
import com.journeyapps.barcodescanner.SourceData;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import kotlinx.coroutines.DebugKt;

/* JADX INFO: loaded from: classes11.dex */
public final class CameraManager {
    private static final String TAG = CameraManager.class.getSimpleName();
    private AmbientLightManager ambientLightManager;
    private AutoFocusManager autoFocusManager;
    private Camera camera;
    private Camera.CameraInfo cameraInfo;
    private Context context;
    private String defaultParameters;
    private DisplayConfiguration displayConfiguration;
    private Size previewSize;
    private boolean previewing;
    private Size requestedPreviewSize;
    private CameraSettings settings = new CameraSettings();
    private int rotationDegrees = -1;
    private final CameraPreviewCallback cameraPreviewCallback = new CameraPreviewCallback();

    private final class CameraPreviewCallback implements Camera.PreviewCallback {
        private PreviewCallback callback;
        private Size resolution;

        public CameraPreviewCallback() {
        }

        public void setResolution(Size resolution) {
            this.resolution = resolution;
        }

        public void setCallback(PreviewCallback callback) {
            this.callback = callback;
        }

        @Override // android.hardware.Camera.PreviewCallback
        public void onPreviewFrame(byte[] data, Camera camera) {
            Size cameraResolution = this.resolution;
            PreviewCallback callback = this.callback;
            if (cameraResolution == null || callback == null) {
                Log.d(CameraManager.TAG, "Got preview callback, but no handler or resolution available");
                if (callback != null) {
                    callback.onPreviewError(new Exception("No resolution available"));
                    return;
                }
                return;
            }
            try {
                if (data == null) {
                    throw new NullPointerException("No preview data received");
                }
                int format = camera.getParameters().getPreviewFormat();
                SourceData source = new SourceData(data, cameraResolution.width, cameraResolution.height, format, CameraManager.this.getCameraRotation());
                callback.onPreview(source);
            } catch (RuntimeException e) {
                Log.e(CameraManager.TAG, "Camera preview failed", e);
                callback.onPreviewError(e);
            }
        }
    }

    public CameraManager(Context context) {
        this.context = context;
    }

    public void open() {
        Camera cameraOpen = OpenCameraInterface.open(this.settings.getRequestedCameraId());
        this.camera = cameraOpen;
        if (cameraOpen == null) {
            throw new RuntimeException("Failed to open camera");
        }
        int cameraId = OpenCameraInterface.getCameraId(this.settings.getRequestedCameraId());
        Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
        this.cameraInfo = cameraInfo;
        Camera.getCameraInfo(cameraId, cameraInfo);
    }

    public void configure() {
        if (this.camera == null) {
            throw new RuntimeException("Camera not open");
        }
        setParameters();
    }

    public void setPreviewDisplay(SurfaceHolder holder) throws IOException {
        setPreviewDisplay(new CameraSurface(holder));
    }

    public void setPreviewDisplay(CameraSurface surface) throws IOException {
        surface.setPreview(this.camera);
    }

    public void startPreview() {
        Camera theCamera = this.camera;
        if (theCamera != null && !this.previewing) {
            theCamera.startPreview();
            this.previewing = true;
            this.autoFocusManager = new AutoFocusManager(this.camera, this.settings);
            AmbientLightManager ambientLightManager = new AmbientLightManager(this.context, this, this.settings);
            this.ambientLightManager = ambientLightManager;
            ambientLightManager.start();
        }
    }

    public void stopPreview() {
        AutoFocusManager autoFocusManager = this.autoFocusManager;
        if (autoFocusManager != null) {
            autoFocusManager.stop();
            this.autoFocusManager = null;
        }
        AmbientLightManager ambientLightManager = this.ambientLightManager;
        if (ambientLightManager != null) {
            ambientLightManager.stop();
            this.ambientLightManager = null;
        }
        Camera camera = this.camera;
        if (camera != null && this.previewing) {
            camera.stopPreview();
            this.cameraPreviewCallback.setCallback(null);
            this.previewing = false;
        }
    }

    public void close() {
        Camera camera = this.camera;
        if (camera != null) {
            camera.release();
            this.camera = null;
        }
    }

    public boolean isCameraRotated() {
        int i = this.rotationDegrees;
        if (i != -1) {
            return i % 180 != 0;
        }
        throw new IllegalStateException("Rotation not calculated yet. Call configure() first.");
    }

    public int getCameraRotation() {
        return this.rotationDegrees;
    }

    private Camera.Parameters getDefaultCameraParameters() {
        Camera.Parameters parameters = this.camera.getParameters();
        String str = this.defaultParameters;
        if (str == null) {
            this.defaultParameters = parameters.flatten();
        } else {
            parameters.unflatten(str);
        }
        return parameters;
    }

    private void setDesiredParameters(boolean safeMode) {
        Camera.Parameters parameters = getDefaultCameraParameters();
        if (parameters == null) {
            Log.w(TAG, "Device error: no camera parameters are available. Proceeding without configuration.");
            return;
        }
        String str = TAG;
        Log.i(str, "Initial camera parameters: " + parameters.flatten());
        if (safeMode) {
            Log.w(str, "In camera config safe mode -- most settings will not be honored");
        }
        CameraConfigurationUtils.setFocus(parameters, this.settings.getFocusMode(), safeMode);
        if (!safeMode) {
            CameraConfigurationUtils.setTorch(parameters, false);
            if (this.settings.isScanInverted()) {
                CameraConfigurationUtils.setInvertColor(parameters);
            }
            if (this.settings.isBarcodeSceneModeEnabled()) {
                CameraConfigurationUtils.setBarcodeSceneMode(parameters);
            }
            if (this.settings.isMeteringEnabled()) {
                CameraConfigurationUtils.setVideoStabilization(parameters);
                CameraConfigurationUtils.setFocusArea(parameters);
                CameraConfigurationUtils.setMetering(parameters);
            }
        }
        List<Size> previewSizes = getPreviewSizes(parameters);
        if (previewSizes.size() == 0) {
            this.requestedPreviewSize = null;
        } else {
            Size bestPreviewSize = this.displayConfiguration.getBestPreviewSize(previewSizes, isCameraRotated());
            this.requestedPreviewSize = bestPreviewSize;
            parameters.setPreviewSize(bestPreviewSize.width, this.requestedPreviewSize.height);
        }
        if (Build.DEVICE.equals("glass-1")) {
            CameraConfigurationUtils.setBestPreviewFPS(parameters);
        }
        Log.i(str, "Final camera parameters: " + parameters.flatten());
        this.camera.setParameters(parameters);
    }

    private static List<Size> getPreviewSizes(Camera.Parameters parameters) {
        List<Camera.Size> rawSupportedSizes = parameters.getSupportedPreviewSizes();
        List<Size> previewSizes = new ArrayList<>();
        if (rawSupportedSizes == null) {
            Camera.Size defaultSize = parameters.getPreviewSize();
            if (defaultSize != null) {
                previewSizes.add(new Size(defaultSize.width, defaultSize.height));
            }
            return previewSizes;
        }
        for (Camera.Size size : rawSupportedSizes) {
            previewSizes.add(new Size(size.width, size.height));
        }
        return previewSizes;
    }

    private int calculateDisplayRotation() {
        int result;
        int rotation = this.displayConfiguration.getRotation();
        int degrees = 0;
        switch (rotation) {
            case 0:
                degrees = 0;
                break;
            case 1:
                degrees = 90;
                break;
            case 2:
                degrees = 180;
                break;
            case 3:
                degrees = 270;
                break;
        }
        if (this.cameraInfo.facing == 1) {
            int result2 = (this.cameraInfo.orientation + degrees) % 360;
            result = (360 - result2) % 360;
        } else {
            result = ((this.cameraInfo.orientation - degrees) + 360) % 360;
        }
        Log.i(TAG, "Camera Display Orientation: " + result);
        return result;
    }

    private void setCameraDisplayOrientation(int rotation) {
        this.camera.setDisplayOrientation(rotation);
    }

    private void setParameters() {
        try {
            int iCalculateDisplayRotation = calculateDisplayRotation();
            this.rotationDegrees = iCalculateDisplayRotation;
            setCameraDisplayOrientation(iCalculateDisplayRotation);
        } catch (Exception e) {
            Log.w(TAG, "Failed to set rotation.");
        }
        try {
            setDesiredParameters(false);
        } catch (Exception e2) {
            try {
                setDesiredParameters(true);
            } catch (Exception e3) {
                Log.w(TAG, "Camera rejected even safe-mode parameters! No configuration");
            }
        }
        Camera.Size realPreviewSize = this.camera.getParameters().getPreviewSize();
        if (realPreviewSize == null) {
            this.previewSize = this.requestedPreviewSize;
        } else {
            this.previewSize = new Size(realPreviewSize.width, realPreviewSize.height);
        }
        this.cameraPreviewCallback.setResolution(this.previewSize);
    }

    public boolean isOpen() {
        return this.camera != null;
    }

    public Size getNaturalPreviewSize() {
        return this.previewSize;
    }

    public Size getPreviewSize() {
        if (this.previewSize == null) {
            return null;
        }
        if (isCameraRotated()) {
            return this.previewSize.rotate();
        }
        return this.previewSize;
    }

    public void requestPreviewFrame(PreviewCallback callback) {
        Camera theCamera = this.camera;
        if (theCamera != null && this.previewing) {
            this.cameraPreviewCallback.setCallback(callback);
            theCamera.setOneShotPreviewCallback(this.cameraPreviewCallback);
        }
    }

    public CameraSettings getCameraSettings() {
        return this.settings;
    }

    public void setCameraSettings(CameraSettings settings) {
        this.settings = settings;
    }

    public DisplayConfiguration getDisplayConfiguration() {
        return this.displayConfiguration;
    }

    public void setDisplayConfiguration(DisplayConfiguration displayConfiguration) {
        this.displayConfiguration = displayConfiguration;
    }

    public void setTorch(boolean on) {
        if (this.camera != null) {
            try {
                boolean isOn = isTorchOn();
                if (on != isOn) {
                    AutoFocusManager autoFocusManager = this.autoFocusManager;
                    if (autoFocusManager != null) {
                        autoFocusManager.stop();
                    }
                    Camera.Parameters parameters = this.camera.getParameters();
                    CameraConfigurationUtils.setTorch(parameters, on);
                    if (this.settings.isExposureEnabled()) {
                        CameraConfigurationUtils.setBestExposure(parameters, on);
                    }
                    this.camera.setParameters(parameters);
                    AutoFocusManager autoFocusManager2 = this.autoFocusManager;
                    if (autoFocusManager2 != null) {
                        autoFocusManager2.start();
                    }
                }
            } catch (RuntimeException e) {
                Log.e(TAG, "Failed to set torch", e);
            }
        }
    }

    public void changeCameraParameters(CameraParametersCallback callback) {
        Camera camera = this.camera;
        if (camera != null) {
            try {
                camera.setParameters(callback.changeCameraParameters(camera.getParameters()));
            } catch (RuntimeException e) {
                Log.e(TAG, "Failed to change camera parameters", e);
            }
        }
    }

    public boolean isTorchOn() {
        String flashMode;
        Camera.Parameters parameters = this.camera.getParameters();
        if (parameters == null || (flashMode = parameters.getFlashMode()) == null) {
            return false;
        }
        return DebugKt.DEBUG_PROPERTY_VALUE_ON.equals(flashMode) || "torch".equals(flashMode);
    }

    public Camera getCamera() {
        return this.camera;
    }
}
