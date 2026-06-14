package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfl extends zzjz<zzfm, zzfl> implements zzlj {
    private zzfl() {
        super(zzfm.zzg);
    }

    public final zzfl zza(int i) {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        zzfm.zzg((zzfm) this.zza, i);
        return this;
    }

    public final zzfl zzb(long j) {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        zzfm.zzh((zzfm) this.zza, j);
        return this;
    }

    /* synthetic */ zzfl(zzff zzffVar) {
        super(zzfm.zzg);
    }
}
