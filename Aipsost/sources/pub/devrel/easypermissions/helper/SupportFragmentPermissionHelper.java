package pub.devrel.easypermissions.helper;

import android.content.Context;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;

/* JADX INFO: loaded from: classes11.dex */
class SupportFragmentPermissionHelper extends BaseSupportPermissionsHelper<Fragment> {
    public SupportFragmentPermissionHelper(Fragment host) {
        super(host);
    }

    @Override // pub.devrel.easypermissions.helper.BaseSupportPermissionsHelper
    public FragmentManager getSupportFragmentManager() {
        return getHost().getChildFragmentManager();
    }

    @Override // pub.devrel.easypermissions.helper.PermissionHelper
    public void directRequestPermissions(int requestCode, String... perms) {
        getHost().requestPermissions(perms, requestCode);
    }

    @Override // pub.devrel.easypermissions.helper.PermissionHelper
    public boolean shouldShowRequestPermissionRationale(String perm) {
        return getHost().shouldShowRequestPermissionRationale(perm);
    }

    @Override // pub.devrel.easypermissions.helper.PermissionHelper
    public Context getContext() {
        return getHost().getActivity();
    }
}
