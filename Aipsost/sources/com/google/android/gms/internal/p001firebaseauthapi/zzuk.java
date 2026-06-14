package com.google.android.gms.internal.p001firebaseauthapi;

import android.text.TextUtils;
import com.google.firebase.auth.internal.zzai;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzuk implements zzyg {
    final /* synthetic */ zzul zza;

    zzuk(zzul zzulVar) {
        this.zza = zzulVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zza.zzb.zzh(zzai.zza(str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        zzabj zzabjVar = (zzabj) obj;
        if (TextUtils.isEmpty(zzabjVar.zzb()) || TextUtils.isEmpty(zzabjVar.zzc())) {
            this.zza.zzb.zzh(zzai.zza("INTERNAL_SUCCESS_SIGN_OUT"));
            return;
        }
        this.zza.zzc.zzO(new zzzy(zzabjVar.zzc(), zzabjVar.zzb(), Long.valueOf(zzaaa.zza(zzabjVar.zzb())), "Bearer"), null, null, false, null, this.zza.zzb, this);
    }
}
