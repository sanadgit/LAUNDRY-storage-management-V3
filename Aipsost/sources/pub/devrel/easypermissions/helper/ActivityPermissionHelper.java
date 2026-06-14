package pub.devrel.easypermissions.helper;

import android.app.Activity;
import android.app.Fragment;
import android.app.FragmentManager;
import android.content.Context;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import pub.devrel.easypermissions.RationaleDialogFragment;

/* JADX INFO: loaded from: classes11.dex */
class ActivityPermissionHelper extends PermissionHelper<Activity> {
    private static final String TAG = "ActPermissionHelper";

    public ActivityPermissionHelper(Activity host) {
        super(host);
    }

    @Override // pub.devrel.easypermissions.helper.PermissionHelper
    public void directRequestPermissions(int requestCode, String... perms) {
        ActivityCompat.requestPermissions(getHost(), perms, requestCode);
    }

    @Override // pub.devrel.easypermissions.helper.PermissionHelper
    public boolean shouldShowRequestPermissionRationale(String perm) {
        return ActivityCompat.shouldShowRequestPermissionRationale(getHost(), perm);
    }

    @Override // pub.devrel.easypermissions.helper.PermissionHelper
    public Context getContext() {
        return getHost();
    }

    @Override // pub.devrel.easypermissions.helper.PermissionHelper
    public void showRequestPermissionRationale(String rationale, String positiveButton, String negativeButton, int theme, int requestCode, String... perms) {
        FragmentManager fm = getHost().getFragmentManager();
        Fragment fragment = fm.findFragmentByTag(RationaleDialogFragment.TAG);
        if (fragment instanceof RationaleDialogFragment) {
            Log.d(TAG, "Found existing fragment, not showing rationale.");
        } else {
            RationaleDialogFragment.newInstance(positiveButton, negativeButton, rationale, theme, requestCode, perms).showAllowingStateLoss(fm, RationaleDialogFragment.TAG);
        }
    }
}
