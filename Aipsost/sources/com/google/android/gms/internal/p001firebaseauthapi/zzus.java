package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzus implements zzyg {
    final /* synthetic */ zzyg zza;
    final /* synthetic */ zzzy zzb;
    final /* synthetic */ zzut zzc;

    zzus(zzut zzutVar, zzyg zzygVar, zzzy zzzyVar) {
        this.zzc = zzutVar;
        this.zza = zzygVar;
        this.zzb = zzzyVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyf
    public final void zza(String str) {
        this.zza.zza(str);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzyg
    public final /* bridge */ /* synthetic */ void zzb(Object obj) {
        List listZzb = ((zzzp) obj).zzb();
        if (listZzb == null || listZzb.isEmpty()) {
            this.zza.zza("No users");
        } else {
            this.zzc.zza.zzi(this.zzb, (zzzr) listZzb.get(0));
        }
    }
}
