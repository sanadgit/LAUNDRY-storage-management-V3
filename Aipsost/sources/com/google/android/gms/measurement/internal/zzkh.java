package com.google.android.gms.measurement.internal;

import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzkh implements zzep {
    final /* synthetic */ String zza;
    final /* synthetic */ zzkn zzb;

    zzkh(zzkn zzknVar, String str) {
        this.zzb = zzknVar;
        this.zza = str;
    }

    @Override // com.google.android.gms.measurement.internal.zzep
    public final void zza(String str, int i, Throwable th, byte[] bArr, Map<String, List<String>> map) {
        this.zzb.zzC(i, th, bArr, this.zza);
    }
}
