package pub.devrel.easypermissions;

import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

/* JADX INFO: loaded from: classes11.dex */
public class AppSettingsDialogHolderActivity extends AppCompatActivity implements DialogInterface.OnClickListener {
    private static final int APP_SETTINGS_RC = 7534;
    private AlertDialog mDialog;
    private int mIntentFlags;

    public static Intent createShowDialogIntent(Context context, AppSettingsDialog dialog) {
        Intent intent = new Intent(context, (Class<?>) AppSettingsDialogHolderActivity.class);
        intent.putExtra("extra_app_settings", dialog);
        return intent;
    }

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        AppSettingsDialog appSettingsDialog = AppSettingsDialog.fromIntent(getIntent(), this);
        this.mIntentFlags = appSettingsDialog.getIntentFlags();
        this.mDialog = appSettingsDialog.showDialog(this, this);
    }

    @Override // androidx.appcompat.app.AppCompatActivity, androidx.fragment.app.FragmentActivity, android.app.Activity
    protected void onDestroy() {
        super.onDestroy();
        AlertDialog alertDialog = this.mDialog;
        if (alertDialog != null && alertDialog.isShowing()) {
            this.mDialog.dismiss();
        }
    }

    @Override // android.content.DialogInterface.OnClickListener
    public void onClick(DialogInterface dialog, int which) {
        if (which == -1) {
            Intent intent = new Intent("android.settings.APPLICATION_DETAILS_SETTINGS").setData(Uri.fromParts("package", getPackageName(), null));
            intent.addFlags(this.mIntentFlags);
            startActivityForResult(intent, APP_SETTINGS_RC);
        } else {
            if (which == -2) {
                setResult(0);
                finish();
                return;
            }
            throw new IllegalStateException("Unknown button type: " + which);
        }
    }

    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, android.app.Activity
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        setResult(resultCode, data);
        finish();
    }
}
