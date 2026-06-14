package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.firebase.auth.internal.zzai;
import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzui implements zzyg {
    final /* synthetic */ zzyg zza;
    final /* synthetic */ zzzy zzb;
    final /* synthetic */ zzuj zzc;

    zzui(zzuj zzujVar, zzyg zzygVar, zzzy zzzyVar) {
        this.zzc = zzujVar;
        this.zza = zzygVar;
        this.zzb = zzzyVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zzc.zzb.zzh(zzai.zza(str));
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        List listZzb = ((zzzp) obj).zzb();
        if (listZzb == null || listZzb.isEmpty()) {
            this.zza.zza("No users.");
            return;
        }
        zzzr zzzrVar = (zzzr) listZzb.get(0);
        zzaao zzaaoVar = new zzaao();
        zzaaoVar.zze(this.zzb.zze());
        zzaaoVar.zzb(this.zzc.zza);
        zzuj zzujVar = this.zzc;
        zzvf.zzf(zzujVar.zzc, zzujVar.zzb, this.zzb, zzzrVar, zzaaoVar, this.zza);
    }
}
