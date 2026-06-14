package com.google.android.gms.measurement.internal;

import androidx.collection.LruCache;
import com.google.android.gms.common.internal.Preconditions;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfi extends LruCache<String, com.google.android.gms.internal.measurement.zzc> {
    final /* synthetic */ zzfl zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzfi(zzfl zzflVar, int i) {
        super(20);
        this.zza = zzflVar;
    }

    @Override // androidx.collection.LruCache
    protected final /* bridge */ /* synthetic */ com.google.android.gms.internal.measurement.zzc create(String str) {
        String str2 = str;
        Preconditions.checkNotEmpty(str2);
        return zzfl.zzo(this.zza, str2);
    }
}
