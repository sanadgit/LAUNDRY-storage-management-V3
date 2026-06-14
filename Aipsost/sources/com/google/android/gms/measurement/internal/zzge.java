package com.google.android.gms.measurement.internal;

import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzge implements Runnable {
    final /* synthetic */ zzp zza;
    final /* synthetic */ zzgm zzb;

    zzge(zzgm zzgmVar, zzp zzpVar) {
        this.zzb = zzgmVar;
        this.zza = zzpVar;
    }

    @Override // java.lang.Runnable
    public final void run() throws Throwable {
        this.zzb.zza.zzG();
        zzkn zzknVar = this.zzb.zza;
        zzp zzpVar = this.zza;
        zzknVar.zzav().zzg();
        zzknVar.zzr();
        Preconditions.checkNotEmpty(zzpVar.zza);
        zzaf zzafVarZzc = zzaf.zzc(zzpVar.zzv);
        zzaf zzafVarZzt = zzknVar.zzt(zzpVar.zza);
        zzknVar.zzau().zzk().zzc("Setting consent, package, consent", zzpVar.zza, zzafVarZzc);
        zzknVar.zzs(zzpVar.zza, zzafVarZzc);
        if (zzafVarZzc.zzi(zzafVarZzt)) {
            zzknVar.zzI(zzpVar);
        }
    }
}
