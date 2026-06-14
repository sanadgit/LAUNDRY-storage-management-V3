package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
abstract class zzke extends zzkd {
    private boolean zza;

    zzke(zzkn zzknVar) {
        super(zzknVar);
        this.zzf.zzL();
    }

    final boolean zzY() {
        return this.zza;
    }

    protected final void zzZ() {
        if (!zzY()) {
            throw new IllegalStateException("Not initialized");
        }
    }

    protected abstract boolean zzaA();

    public final void zzaa() {
        if (this.zza) {
            throw new IllegalStateException("Can't initialize twice");
        }
        zzaA();
        this.zzf.zzM();
        this.zza = true;
    }
}
