package pub.devrel.easypermissions;

import android.app.Activity;
import androidx.fragment.app.Fragment;
import java.util.Arrays;
import pub.devrel.easypermissions.helper.PermissionHelper;

/* JADX INFO: loaded from: classes11.dex */
public final class PermissionRequest {
    private final PermissionHelper mHelper;
    private final String mNegativeButtonText;
    private final String[] mPerms;
    private final String mPositiveButtonText;
    private final String mRationale;
    private final int mRequestCode;
    private final int mTheme;

    private PermissionRequest(PermissionHelper helper, String[] perms, int requestCode, String rationale, String positiveButtonText, String negativeButtonText, int theme) {
        this.mHelper = helper;
        this.mPerms = (String[]) perms.clone();
        this.mRequestCode = requestCode;
        this.mRationale = rationale;
        this.mPositiveButtonText = positiveButtonText;
        this.mNegativeButtonText = negativeButtonText;
        this.mTheme = theme;
    }

    public PermissionHelper getHelper() {
        return this.mHelper;
    }

    public String[] getPerms() {
        return (String[]) this.mPerms.clone();
    }

    public int getRequestCode() {
        return this.mRequestCode;
    }

    public String getRationale() {
        return this.mRationale;
    }

    public String getPositiveButtonText() {
        return this.mPositiveButtonText;
    }

    public String getNegativeButtonText() {
        return this.mNegativeButtonText;
    }

    public int getTheme() {
        return this.mTheme;
    }

    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        PermissionRequest request = (PermissionRequest) o;
        return Arrays.equals(this.mPerms, request.mPerms) && this.mRequestCode == request.mRequestCode;
    }

    public int hashCode() {
        int result = Arrays.hashCode(this.mPerms);
        return (result * 31) + this.mRequestCode;
    }

    public String toString() {
        return "PermissionRequest{mHelper=" + this.mHelper + ", mPerms=" + Arrays.toString(this.mPerms) + ", mRequestCode=" + this.mRequestCode + ", mRationale='" + this.mRationale + "', mPositiveButtonText='" + this.mPositiveButtonText + "', mNegativeButtonText='" + this.mNegativeButtonText + "', mTheme=" + this.mTheme + '}';
    }

    public static final class Builder {
        private final PermissionHelper mHelper;
        private String mNegativeButtonText;
        private final String[] mPerms;
        private String mPositiveButtonText;
        private String mRationale;
        private final int mRequestCode;
        private int mTheme = -1;

        public Builder(Activity activity, int requestCode, String... perms) {
            this.mHelper = PermissionHelper.newInstance(activity);
            this.mRequestCode = requestCode;
            this.mPerms = perms;
        }

        public Builder(Fragment fragment, int requestCode, String... perms) {
            this.mHelper = PermissionHelper.newInstance(fragment);
            this.mRequestCode = requestCode;
            this.mPerms = perms;
        }

        public Builder setRationale(String rationale) {
            this.mRationale = rationale;
            return this;
        }

        public Builder setRationale(int resId) {
            this.mRationale = this.mHelper.getContext().getString(resId);
            return this;
        }

        public Builder setPositiveButtonText(String positiveButtonText) {
            this.mPositiveButtonText = positiveButtonText;
            return this;
        }

        public Builder setPositiveButtonText(int resId) {
            this.mPositiveButtonText = this.mHelper.getContext().getString(resId);
            return this;
        }

        public Builder setNegativeButtonText(String negativeButtonText) {
            this.mNegativeButtonText = negativeButtonText;
            return this;
        }

        public Builder setNegativeButtonText(int resId) {
            this.mNegativeButtonText = this.mHelper.getContext().getString(resId);
            return this;
        }

        public Builder setTheme(int theme) {
            this.mTheme = theme;
            return this;
        }

        public PermissionRequest build() {
            if (this.mRationale == null) {
                this.mRationale = this.mHelper.getContext().getString(R.string.rationale_ask);
            }
            if (this.mPositiveButtonText == null) {
                this.mPositiveButtonText = this.mHelper.getContext().getString(android.R.string.ok);
            }
            if (this.mNegativeButtonText == null) {
                this.mNegativeButtonText = this.mHelper.getContext().getString(android.R.string.cancel);
            }
            return new PermissionRequest(this.mHelper, this.mPerms, this.mRequestCode, this.mRationale, this.mPositiveButtonText, this.mNegativeButtonText, this.mTheme);
        }
    }
}
