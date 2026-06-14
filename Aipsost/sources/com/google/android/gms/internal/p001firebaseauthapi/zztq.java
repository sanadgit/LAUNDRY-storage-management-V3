package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.auth.EmailAuthCredential;
import com.google.firebase.auth.internal.zzai;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zztq implements zzyg {
    final /* synthetic */ EmailAuthCredential zza;
    final /* synthetic */ zzxa zzb;
    final /* synthetic */ zzvf zzc;

    zztq(zzvf zzvfVar, EmailAuthCredential emailAuthCredential, zzxa zzxaVar) {
        this.zzc = zzvfVar;
        this.zza = emailAuthCredential;
        this.zzb = zzxaVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zzb.zzh(zzai.zza(str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        this.zzc.zzN(new zzzg(this.zza, ((zzzy) obj).zze()), this.zzb);
    }
}
