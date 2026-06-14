package pub.devrel.easypermissions;

import android.app.Dialog;
import android.app.DialogFragment;
import android.app.FragmentManager;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import pub.devrel.easypermissions.EasyPermissions;

/* JADX INFO: loaded from: classes11.dex */
public class RationaleDialogFragment extends DialogFragment {
    public static final String TAG = "RationaleDialogFragment";
    private EasyPermissions.PermissionCallbacks mPermissionCallbacks;
    private EasyPermissions.RationaleCallbacks mRationaleCallbacks;
    private boolean mStateSaved = false;

    public static RationaleDialogFragment newInstance(String positiveButton, String negativeButton, String rationaleMsg, int theme, int requestCode, String[] permissions) {
        RationaleDialogFragment dialogFragment = new RationaleDialogFragment();
        RationaleDialogConfig config = new RationaleDialogConfig(positiveButton, negativeButton, rationaleMsg, theme, requestCode, permissions);
        dialogFragment.setArguments(config.toBundle());
        return dialogFragment;
    }

    /* JADX WARN: Multi-variable type inference failed */
    @Override // android.app.DialogFragment, android.app.Fragment
    public void onAttach(Context context) {
        super.onAttach(context);
        if (getParentFragment() != null) {
            if (getParentFragment() instanceof EasyPermissions.PermissionCallbacks) {
                this.mPermissionCallbacks = (EasyPermissions.PermissionCallbacks) getParentFragment();
            }
            if (getParentFragment() instanceof EasyPermissions.RationaleCallbacks) {
                this.mRationaleCallbacks = (EasyPermissions.RationaleCallbacks) getParentFragment();
            }
        }
        if (context instanceof EasyPermissions.PermissionCallbacks) {
            this.mPermissionCallbacks = (EasyPermissions.PermissionCallbacks) context;
        }
        if (context instanceof EasyPermissions.RationaleCallbacks) {
            this.mRationaleCallbacks = (EasyPermissions.RationaleCallbacks) context;
        }
    }

    @Override // android.app.DialogFragment, android.app.Fragment
    public void onSaveInstanceState(Bundle outState) {
        this.mStateSaved = true;
        super.onSaveInstanceState(outState);
    }

    public void showAllowingStateLoss(FragmentManager manager, String tag) {
        if ((Build.VERSION.SDK_INT >= 26 && manager.isStateSaved()) || this.mStateSaved) {
            return;
        }
        show(manager, tag);
    }

    @Override // android.app.DialogFragment, android.app.Fragment
    public void onDetach() {
        super.onDetach();
        this.mPermissionCallbacks = null;
    }

    @Override // android.app.DialogFragment
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        setCancelable(false);
        RationaleDialogConfig config = new RationaleDialogConfig(getArguments());
        RationaleDialogClickListener clickListener = new RationaleDialogClickListener(this, config, this.mPermissionCallbacks, this.mRationaleCallbacks);
        return config.createFrameworkDialog(getActivity(), clickListener);
    }
}
