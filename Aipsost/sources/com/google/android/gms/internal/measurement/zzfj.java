package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfj extends zzjz<zzfk, zzfj> implements zzlj {
    private zzfj() {
        super(zzfk.zzi);
    }

    public final zzfj zza(int i) {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        zzfk.zzj((zzfk) this.zza, i);
        return this;
    }

    public final zzfj zzb(zzgc zzgcVar) {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        zzfk.zzk((zzfk) this.zza, zzgcVar.zzaA());
        return this;
    }

    public final zzfj zzc(zzgd zzgdVar) {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        zzfk.zzm((zzfk) this.zza, zzgdVar);
        return this;
    }

    public final zzfj zzd(boolean z) {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        zzfk.zzn((zzfk) this.zza, z);
        return this;
    }

    /* synthetic */ zzfj(zzff zzffVar) {
        super(zzfk.zzi);
    }
}
