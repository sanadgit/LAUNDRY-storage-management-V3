package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
abstract class zzgo extends zzgn {
    private boolean zza;

    zzgo(zzfu zzfuVar) {
        super(zzfuVar);
        this.zzs.zzJ();
    }

    protected abstract boolean zza();

    protected void zzaz() {
    }

    final boolean zzu() {
        return this.zza;
    }

    protected final void zzv() {
        if (!zzu()) {
            throw new IllegalStateException("Not initialized");
        }
    }

    public final void zzx() {
        if (this.zza) {
            throw new IllegalStateException("Can't initialize twice");
        }
        if (zza()) {
            return;
        }
        this.zzs.zzK();
        this.zza = true;
    }

    public final void zzy() {
        if (this.zza) {
            throw new IllegalStateException("Can't initialize twice");
        }
        zzaz();
        this.zzs.zzK();
        this.zza = true;
    }
}
