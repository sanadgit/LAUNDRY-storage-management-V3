package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.auth.internal.zzai;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzug implements zzyg {
    final /* synthetic */ zzaay zza;
    final /* synthetic */ zzxa zzb;
    final /* synthetic */ zzvf zzc;

    zzug(zzvf zzvfVar, zzaay zzaayVar, zzxa zzxaVar) {
        this.zzc = zzvfVar;
        this.zza = zzaayVar;
        this.zzb = zzxaVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zzb.zzh(zzai.zza(str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        this.zza.zzd(true);
        this.zza.zzc(((zzzy) obj).zze());
        this.zzc.zza.zzq(this.zza, new zzuf(this, this));
    }
}
