package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.auth.internal.zzai;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzub implements zzyg {
    final /* synthetic */ zzxa zza;
    final /* synthetic */ zzvf zzb;

    zzub(zzvf zzvfVar, zzxa zzxaVar) {
        this.zzb = zzvfVar;
        this.zza = zzxaVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zza.zzh(zzai.zza(str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        zzabh zzabhVar = (zzabh) obj;
        this.zzb.zzO(new zzzy(zzabhVar.zze(), zzabhVar.zzc(), Long.valueOf(zzabhVar.zzb()), "Bearer"), null, null, Boolean.valueOf(zzabhVar.zzg()), null, this.zza, this);
    }
}
