package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.auth.internal.zzai;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzup implements zzyg {
    final /* synthetic */ zzzi zza;
    final /* synthetic */ zzxa zzb;
    final /* synthetic */ zzvf zzc;

    zzup(zzvf zzvfVar, zzzi zzziVar, zzxa zzxaVar) {
        this.zzc = zzvfVar;
        this.zza = zzziVar;
        this.zzb = zzxaVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zzb.zzh(zzai.zza(str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        this.zza.zzc(((zzzy) obj).zze());
        this.zzc.zza.zzd(this.zza, new zzuo(this));
    }
}
