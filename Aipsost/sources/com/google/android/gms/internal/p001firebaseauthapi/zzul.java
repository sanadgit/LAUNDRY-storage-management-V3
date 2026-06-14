package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.auth.internal.zzai;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzul implements zzyg {
    final /* synthetic */ String zza;
    final /* synthetic */ zzxa zzb;
    final /* synthetic */ zzvf zzc;

    zzul(zzvf zzvfVar, String str, zzxa zzxaVar) {
        this.zzc = zzvfVar;
        this.zza = str;
        this.zzb = zzxaVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zzb.zzh(zzai.zza(str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        this.zzc.zza.zzu(new zzabi(((zzzy) obj).zze(), this.zza), new zzuk(this));
    }
}
