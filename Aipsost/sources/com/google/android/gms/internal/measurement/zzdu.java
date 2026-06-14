package com.google.android.gms.internal.measurement;

import android.os.Bundle;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-sdk-api@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzdu extends zzch {
    private final com.google.android.gms.measurement.internal.zzgu zza;

    zzdu(com.google.android.gms.measurement.internal.zzgu zzguVar) {
        this.zza = zzguVar;
    }

    @Override // com.google.android.gms.internal.measurement.zzci
    public final void zzd(String str, String str2, Bundle bundle, long j) {
        this.zza.interceptEvent(str, str2, bundle, j);
    }

    @Override // com.google.android.gms.internal.measurement.zzci
    public final int zze() {
        return System.identityHashCode(this.zza);
    }
}
