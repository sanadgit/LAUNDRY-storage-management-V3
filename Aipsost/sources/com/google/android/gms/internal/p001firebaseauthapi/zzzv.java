package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.common.internal.Preconditions;
import com.google.firebase.auth.ActionCodeSettings;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzzv implements zzxm {
    private final String zza;
    private String zzb;
    private String zzc;
    private String zzd;
    private ActionCodeSettings zze;
    private String zzf;

    public zzzv(int i) {
        String str;
        switch (i) {
            case 1:
                str = "PASSWORD_RESET";
                break;
            case 2:
            case 3:
            case 5:
            default:
                str = "REQUEST_TYPE_UNSET_ENUM_VALUE";
                break;
            case 4:
                str = "VERIFY_EMAIL";
                break;
            case 6:
                str = "EMAIL_SIGNIN";
                break;
            case 7:
                str = "VERIFY_AND_CHANGE_EMAIL";
                break;
        }
        this.zza = str;
    }

    private zzzv(int i, ActionCodeSettings actionCodeSettings, String str, String str2, String str3, String str4) {
        this.zza = "VERIFY_AND_CHANGE_EMAIL";
        this.zze = (ActionCodeSettings) Preconditions.checkNotNull(actionCodeSettings);
        this.zzb = null;
        this.zzc = str2;
        this.zzd = str3;
        this.zzf = null;
    }

    public static zzzv zzc(ActionCodeSettings actionCodeSettings, String str, String str2) {
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotEmpty(str2);
        Preconditions.checkNotNull(actionCodeSettings);
        return new zzzv(7, actionCodeSettings, null, str2, str, null);
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Removed duplicated region for block: B:17:0x0039  */
    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzxm
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final java.lang.String zza() throws org.json.JSONException {
        /*
            Method dump skipped, instruction units count: 286
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.p001firebaseauthapi.zzzv.zza():java.lang.String");
    }

    public final ActionCodeSettings zzb() {
        return this.zze;
    }

    public final zzzv zzd(ActionCodeSettings actionCodeSettings) {
        this.zze = (ActionCodeSettings) Preconditions.checkNotNull(actionCodeSettings);
        return this;
    }

    public final zzzv zze(String str) {
        this.zzb = Preconditions.checkNotEmpty(str);
        return this;
    }

    public final zzzv zzf(String str) {
        this.zzf = str;
        return this;
    }

    public final zzzv zzg(String str) {
        this.zzd = Preconditions.checkNotEmpty(str);
        return this;
    }
}
