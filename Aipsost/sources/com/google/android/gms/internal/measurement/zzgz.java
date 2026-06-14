package com.google.android.gms.internal.measurement;

import android.database.ContentObserver;
import android.os.Handler;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzgz extends ContentObserver {
    final /* synthetic */ zzha zza;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    zzgz(zzha zzhaVar, Handler handler) {
        super(null);
        this.zza = zzhaVar;
    }

    @Override // android.database.ContentObserver
    public final void onChange(boolean z) {
        this.zza.zzc();
    }
}
