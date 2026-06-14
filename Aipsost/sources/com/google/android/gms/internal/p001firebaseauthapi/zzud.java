package com.google.android.gms.internal.p001firebaseauthapi;

import android.text.TextUtils;
import com.google.android.gms.common.api.Status;
import com.google.firebase.FirebaseError;
import com.google.firebase.auth.PhoneAuthCredential;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzud implements zzyg {
    final /* synthetic */ zzyg zza;
    final /* synthetic */ zzue zzb;

    zzud(zzue zzueVar, zzyg zzygVar) {
        this.zzb = zzueVar;
        this.zza = zzygVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zza.zza(str);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        zzabh zzabhVar = (zzabh) obj;
        if (TextUtils.isEmpty(zzabhVar.zzf())) {
            this.zzb.zzc.zzO(new zzzy(zzabhVar.zze(), zzabhVar.zzc(), Long.valueOf(zzabhVar.zzb()), "Bearer"), null, "phone", Boolean.valueOf(zzabhVar.zzg()), null, this.zzb.zzb, this.zza);
        } else {
            this.zzb.zzb.zzg(new Status(FirebaseError.ERROR_CREDENTIAL_ALREADY_IN_USE), PhoneAuthCredential.zzd(zzabhVar.zzd(), zzabhVar.zzf()));
        }
    }
}
