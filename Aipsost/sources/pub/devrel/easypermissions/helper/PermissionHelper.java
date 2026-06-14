package pub.devrel.easypermissions.helper;

import android.app.Activity;
import android.content.Context;
import android.os.Build;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import java.util.List;

/* JADX INFO: loaded from: classes11.dex */
public abstract class PermissionHelper<T> {
    private T mHost;

    public abstract void directRequestPermissions(int i, String... strArr);

    public abstract Context getContext();

    public abstract boolean shouldShowRequestPermissionRationale(String str);

    public abstract void showRequestPermissionRationale(String str, String str2, String str3, int i, int i2, String... strArr);

    public static PermissionHelper<? extends Activity> newInstance(Activity host) {
        if (Build.VERSION.SDK_INT < 23) {
            return new LowApiPermissionsHelper(host);
        }
        if (host instanceof AppCompatActivity) {
            return new AppCompatActivityPermissionsHelper((AppCompatActivity) host);
        }
        return new ActivityPermissionHelper(host);
    }

    public static PermissionHelper<Fragment> newInstance(Fragment host) {
        if (Build.VERSION.SDK_INT < 23) {
            return new LowApiPermissionsHelper(host);
        }
        return new SupportFragmentPermissionHelper(host);
    }

    public PermissionHelper(T host) {
        this.mHost = host;
    }

    private boolean shouldShowRationale(String... perms) {
        for (String perm : perms) {
            if (shouldShowRequestPermissionRationale(perm)) {
                return true;
            }
        }
        return false;
    }

    public void requestPermissions(String rationale, String positiveButton, String negativeButton, int theme, int requestCode, String... perms) {
        if (shouldShowRationale(perms)) {
            showRequestPermissionRationale(rationale, positiveButton, negativeButton, theme, requestCode, perms);
        } else {
            directRequestPermissions(requestCode, perms);
        }
    }

    public boolean somePermissionPermanentlyDenied(List<String> perms) {
        for (String deniedPermission : perms) {
            if (permissionPermanentlyDenied(deniedPermission)) {
                return true;
            }
        }
        return false;
    }

    public boolean permissionPermanentlyDenied(String perms) {
        return !shouldShowRequestPermissionRationale(perms);
    }

    public boolean somePermissionDenied(String... perms) {
        return shouldShowRationale(perms);
    }

    public T getHost() {
        return this.mHost;
    }
}
