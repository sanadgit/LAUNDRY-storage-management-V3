package com.google.android.gms.measurement.internal;

import java.util.List;
import java.util.concurrent.Callable;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfz implements Callable<List<zzks>> {
    final /* synthetic */ String zza;
    final /* synthetic */ String zzb;
    final /* synthetic */ String zzc;
    final /* synthetic */ zzgm zzd;

    zzfz(zzgm zzgmVar, String str, String str2, String str3) {
        this.zzd = zzgmVar;
        this.zza = str;
        this.zzb = str2;
        this.zzc = str3;
    }

    @Override // java.util.concurrent.Callable
    public final /* bridge */ /* synthetic */ List<zzks> call() throws Exception {
        this.zzd.zza.zzG();
        return this.zzd.zza.zzi().zzm(this.zza, this.zzb, this.zzc);
    }
}
