package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.auth.internal.zzai;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzun implements zzyg {
    final /* synthetic */ zzxa zza;
    final /* synthetic */ zzvf zzb;

    zzun(zzvf zzvfVar, zzxa zzxaVar) {
        this.zzb = zzvfVar;
        this.zza = zzxaVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zza.zzh(zzai.zza(str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        zzabc zzabcVar = (zzabc) obj;
        this.zzb.zzO(new zzzy(zzabcVar.zzd(), zzabcVar.zzc(), Long.valueOf(zzabcVar.zzb()), "Bearer"), null, null, Boolean.valueOf(zzabcVar.zze()), null, this.zza, this);
    }
}
