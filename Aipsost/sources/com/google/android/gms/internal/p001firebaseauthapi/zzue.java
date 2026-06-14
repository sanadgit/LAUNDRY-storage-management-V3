package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.auth.internal.zzai;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzue implements zzyg {
    final /* synthetic */ zzabg zza;
    final /* synthetic */ zzxa zzb;
    final /* synthetic */ zzvf zzc;

    zzue(zzvf zzvfVar, zzabg zzabgVar, zzxa zzxaVar) {
        this.zzc = zzvfVar;
        this.zza = zzabgVar;
        this.zzb = zzxaVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zzb.zzh(zzai.zza(str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        this.zza.zzd(((zzzy) obj).zze());
        this.zzc.zza.zzt(this.zza, new zzud(this, this));
    }
}
