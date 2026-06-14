package com.google.android.gms.measurement.internal;

import com.google.android.gms.internal.measurement.zzpt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzgf implements Runnable {
    final /* synthetic */ zzas zza;
    final /* synthetic */ zzp zzb;
    final /* synthetic */ zzgm zzc;

    zzgf(zzgm zzgmVar, zzas zzasVar, zzp zzpVar) {
        this.zzc = zzgmVar;
        this.zza = zzasVar;
        this.zzb = zzpVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        zzas zzasVarZzc = this.zzc.zzc(this.zza, this.zzb);
        zzpt.zzb();
        if (this.zzc.zza.zzd().zzn(null, zzea.zzaD)) {
            this.zzc.zzb(zzasVarZzc, this.zzb);
        } else {
            this.zzc.zzz(zzasVarZzc, this.zzb);
        }
    }
}
