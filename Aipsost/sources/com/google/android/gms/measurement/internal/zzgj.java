package com.google.android.gms.measurement.internal;

import java.util.List;
import java.util.concurrent.Callable;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzgj implements Callable<List<zzks>> {
    final /* synthetic */ String zza;
    final /* synthetic */ zzgm zzb;

    zzgj(zzgm zzgmVar, String str) {
        this.zzb = zzgmVar;
        this.zza = str;
    }

    @Override // java.util.concurrent.Callable
    public final /* bridge */ /* synthetic */ List<zzks> call() throws Exception {
        this.zzb.zza.zzG();
        return this.zzb.zza.zzi().zzl(this.zza);
    }
}
