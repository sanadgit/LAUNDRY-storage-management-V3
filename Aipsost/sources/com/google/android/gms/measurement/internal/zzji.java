package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzji implements Runnable {
    final /* synthetic */ zzjj zza;

    zzji(zzjj zzjjVar) {
        this.zza = zzjjVar;
    }

    @Override // java.lang.Runnable
    public final void run() {
        zzjk.zzK(this.zza.zza, null);
        this.zza.zza.zzR();
    }
}
