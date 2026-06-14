package com.google.android.gms.internal.p001firebaseauthapi;

import android.content.Context;
import android.content.pm.PackageManager;
import android.util.Log;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.util.AndroidUtilsLight;
import com.google.android.gms.common.util.Hex;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzyk {
    private final String zza;
    private final String zzb;

    public zzyk(Context context, String str) {
        Preconditions.checkNotNull(context);
        String strCheckNotEmpty = Preconditions.checkNotEmpty(str);
        this.zza = strCheckNotEmpty;
        try {
            byte[] packageCertificateHashBytes = AndroidUtilsLight.getPackageCertificateHashBytes(context, strCheckNotEmpty);
            if (packageCertificateHashBytes != null) {
                this.zzb = Hex.bytesToStringUppercase(packageCertificateHashBytes, false);
            } else {
                Log.e("FBA-PackageInfo", "single cert required: ".concat(String.valueOf(str)));
                this.zzb = null;
            }
        } catch (PackageManager.NameNotFoundException e) {
            Log.e("FBA-PackageInfo", "no pkg: ".concat(String.valueOf(str)));
            this.zzb = null;
        }
    }

    public final String zza() {
        return this.zzb;
    }

    public final String zzb() {
        return this.zza;
    }
}
