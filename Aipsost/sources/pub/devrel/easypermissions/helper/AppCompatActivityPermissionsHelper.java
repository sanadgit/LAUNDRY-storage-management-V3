package pub.devrel.easypermissions.helper;

import android.content.Context;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.fragment.app.FragmentManager;

/* JADX INFO: loaded from: classes11.dex */
class AppCompatActivityPermissionsHelper extends BaseSupportPermissionsHelper<AppCompatActivity> {
    public AppCompatActivityPermissionsHelper(AppCompatActivity host) {
        super(host);
    }

    @Override // pub.devrel.easypermissions.helper.BaseSupportPermissionsHelper
    public FragmentManager getSupportFragmentManager() {
        return getHost().getSupportFragmentManager();
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
}
