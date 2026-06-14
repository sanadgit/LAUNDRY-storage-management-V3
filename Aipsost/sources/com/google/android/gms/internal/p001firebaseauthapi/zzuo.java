package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.auth.internal.zzai;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzuo implements zzyg {
    final /* synthetic */ zzup zza;

    zzuo(zzup zzupVar) {
        this.zza = zzupVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zza.zzb.zzh(zzai.zza(str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        zzzj zzzjVar = (zzzj) obj;
        this.zza.zzc.zzO(new zzzy(zzzjVar.zzc(), zzzjVar.zzb(), Long.valueOf(zzaaa.zza(zzzjVar.zzb())), "Bearer"), null, null, false, null, this.zza.zzb, this);
    }
}
