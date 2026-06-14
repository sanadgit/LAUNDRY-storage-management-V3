package pub.devrel.easypermissions;

import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import pub.devrel.easypermissions.PermissionRequest;
import pub.devrel.easypermissions.helper.PermissionHelper;

/* JADX INFO: loaded from: classes11.dex */
public class EasyPermissions {
    private static final String TAG = "EasyPermissions";

    public interface PermissionCallbacks extends ActivityCompat.OnRequestPermissionsResultCallback {
        void onPermissionsDenied(int i, List<String> list);

        void onPermissionsGranted(int i, List<String> list);
    }

    public interface RationaleCallbacks {
        void onRationaleAccepted(int i);

        void onRationaleDenied(int i);
    }

    public static boolean hasPermissions(Context context, String... perms) {
        if (Build.VERSION.SDK_INT < 23) {
            Log.w(TAG, "hasPermissions: API version < M, returning true by default");
            return true;
        }
        if (context == null) {
            throw new IllegalArgumentException("Can't check permissions for null context");
        }
        for (String perm : perms) {
            if (ContextCompat.checkSelfPermission(context, perm) != 0) {
                return false;
            }
        }
        return true;
    }

    public static void requestPermissions(Activity host, String rationale, int requestCode, String... perms) {
        requestPermissions(new PermissionRequest.Builder(host, requestCode, perms).setRationale(rationale).build());
    }

    public static void requestPermissions(Fragment host, String rationale, int requestCode, String... perms) {
        requestPermissions(new PermissionRequest.Builder(host, requestCode, perms).setRationale(rationale).build());
    }

    public static void requestPermissions(PermissionRequest request) {
        if (hasPermissions(request.getHelper().getContext(), request.getPerms())) {
            notifyAlreadyHasPermissions(request.getHelper().getHost(), request.getRequestCode(), request.getPerms());
        } else {
            request.getHelper().requestPermissions(request.getRationale(), request.getPositiveButtonText(), request.getNegativeButtonText(), request.getTheme(), request.getRequestCode(), request.getPerms());
        }
    }

    public static void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults, Object... receivers) {
        List<String> granted = new ArrayList<>();
        List<String> denied = new ArrayList<>();
        for (int i = 0; i < permissions.length; i++) {
            String perm = permissions[i];
            if (grantResults[i] == 0) {
                granted.add(perm);
            } else {
                denied.add(perm);
            }
        }
        for (Object object : receivers) {
            if (!granted.isEmpty() && (object instanceof PermissionCallbacks)) {
                ((PermissionCallbacks) object).onPermissionsGranted(requestCode, granted);
            }
            if (!denied.isEmpty() && (object instanceof PermissionCallbacks)) {
                ((PermissionCallbacks) object).onPermissionsDenied(requestCode, denied);
            }
            if (!granted.isEmpty() && denied.isEmpty()) {
                runAnnotatedMethods(object, requestCode);
            }
        }
    }

    public static boolean somePermissionPermanentlyDenied(Activity host, List<String> deniedPermissions) {
        return PermissionHelper.newInstance(host).somePermissionPermanentlyDenied(deniedPermissions);
    }

    public static boolean somePermissionPermanentlyDenied(Fragment host, List<String> deniedPermissions) {
        return PermissionHelper.newInstance(host).somePermissionPermanentlyDenied(deniedPermissions);
    }

    public static boolean permissionPermanentlyDenied(Activity host, String deniedPermission) {
        return PermissionHelper.newInstance(host).permissionPermanentlyDenied(deniedPermission);
    }

    public static boolean permissionPermanentlyDenied(Fragment host, String deniedPermission) {
        return PermissionHelper.newInstance(host).permissionPermanentlyDenied(deniedPermission);
    }

    public static boolean somePermissionDenied(Activity host, String... perms) {
        return PermissionHelper.newInstance(host).somePermissionDenied(perms);
    }

    public static boolean somePermissionDenied(Fragment host, String... perms) {
        return PermissionHelper.newInstance(host).somePermissionDenied(perms);
    }

    private static void notifyAlreadyHasPermissions(Object object, int requestCode, String[] perms) {
        int[] grantResults = new int[perms.length];
        for (int i = 0; i < perms.length; i++) {
            grantResults[i] = 0;
        }
        onRequestPermissionsResult(requestCode, perms, grantResults, object);
    }

    private static void runAnnotatedMethods(Object object, int requestCode) {
        Class<?> superclass = object.getClass();
        if (isUsingAndroidAnnotations(object)) {
            superclass = superclass.getSuperclass();
        }
        while (superclass != null) {
            for (Method method : superclass.getDeclaredMethods()) {
                AfterPermissionGranted ann = (AfterPermissionGranted) method.getAnnotation(AfterPermissionGranted.class);
                if (ann != null && ann.value() == requestCode) {
                    if (method.getParameterTypes().length > 0) {
                        throw new RuntimeException("Cannot execute method " + method.getName() + " because it is non-void method and/or has input parameters.");
                    }
                    try {
                        if (!method.isAccessible()) {
                            method.setAccessible(true);
                        }
                        method.invoke(object, new Object[0]);
                    } catch (IllegalAccessException e) {
                        Log.e(TAG, "runDefaultMethod:IllegalAccessException", e);
                    } catch (InvocationTargetException e2) {
                        Log.e(TAG, "runDefaultMethod:InvocationTargetException", e2);
                    }
                }
            }
            superclass = superclass.getSuperclass();
        }
    }

    private static boolean isUsingAndroidAnnotations(Object object) {
        if (!object.getClass().getSimpleName().endsWith("_")) {
            return false;
        }
        try {
            return Class.forName("org.androidannotations.api.view.HasViews").isInstance(object);
        } catch (ClassNotFoundException e) {
            return false;
        }
    }
}
