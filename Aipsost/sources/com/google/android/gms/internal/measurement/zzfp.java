package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfp extends zzjz<zzfq, zzfp> implements zzlj {
    private zzfp() {
        super(zzfq.zzg);
    }

    public final zzfp zza(String str) {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        zzfq.zzc((zzfq) this.zza, str);
        return this;
    }

    public final zzfp zzb(long j) {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        zzfq.zzd((zzfq) this.zza, j);
        return this;
    }

    /* synthetic */ zzfp(zzff zzffVar) {
        super(zzfq.zzg);
    }
}
