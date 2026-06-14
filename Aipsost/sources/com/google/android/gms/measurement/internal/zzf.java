package com.google.android.gms.measurement.internal;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
abstract class zzf extends zze {
    private boolean zza;

    zzf(zzfu zzfuVar) {
        super(zzfuVar);
        this.zzs.zzJ();
    }

    final boolean zza() {
        return this.zza;
    }

    protected final void zzb() {
        if (!zza()) {
            throw new IllegalStateException("Not initialized");
        }
    }

    public final void zzc() {
        if (this.zza) {
            throw new IllegalStateException("Can't initialize twice");
        }
        if (zze()) {
            return;
        }
        this.zzs.zzK();
        this.zza = true;
    }

    protected abstract boolean zze();

    protected void zzf() {
    }

    public final void zzd() {
        if (this.zza) {
            throw new IllegalStateException("Can't initialize twice");
        }
        zzf();
        this.zzs.zzK();
        this.zza = true;
    }
}
