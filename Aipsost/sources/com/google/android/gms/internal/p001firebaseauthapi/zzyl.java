package com.google.android.gms.internal.p001firebaseauthapi;

import android.text.TextUtils;
import com.google.firebase.auth.PhoneAuthCredential;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzyl {
    public static zzabg zza(PhoneAuthCredential phoneAuthCredential) {
        return !TextUtils.isEmpty(phoneAuthCredential.zzh()) ? zzabg.zzc(phoneAuthCredential.zzf(), phoneAuthCredential.zzh(), phoneAuthCredential.zzi()) : zzabg.zzb(phoneAuthCredential.zzg(), phoneAuthCredential.getSmsCode(), phoneAuthCredential.zzi());
    }
}
