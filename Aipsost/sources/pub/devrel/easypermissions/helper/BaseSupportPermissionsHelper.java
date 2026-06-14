package pub.devrel.easypermissions.helper;

import android.util.Log;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import pub.devrel.easypermissions.RationaleDialogFragmentCompat;

/* JADX INFO: loaded from: classes11.dex */
public abstract class BaseSupportPermissionsHelper<T> extends PermissionHelper<T> {
    private static final String TAG = "BSPermissionsHelper";

    public abstract FragmentManager getSupportFragmentManager();

    public BaseSupportPermissionsHelper(T host) {
        super(host);
    }

    @Override // pub.devrel.easypermissions.helper.PermissionHelper
    public void showRequestPermissionRationale(String rationale, String positiveButton, String negativeButton, int theme, int requestCode, String... perms) {
        FragmentManager fm = getSupportFragmentManager();
        Fragment fragment = fm.findFragmentByTag(RationaleDialogFragmentCompat.TAG);
        if (fragment instanceof RationaleDialogFragmentCompat) {
            Log.d(TAG, "Found existing fragment, not showing rationale.");
        } else {
            RationaleDialogFragmentCompat.newInstance(rationale, positiveButton, negativeButton, theme, requestCode, perms).showAllowingStateLoss(fm, RationaleDialogFragmentCompat.TAG);
        }
    }
}
