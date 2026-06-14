package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzeg extends zzjz<zzeh, zzeg> implements zzlj {
    private zzeg() {
        super(zzeh.zzj);
    }

    public final int zza() {
        return ((zzeh) this.zza).zzd();
    }

    public final zzes zzb(int i) {
        return ((zzeh) this.zza).zze(i);
    }

    public final zzeg zzc(int i, zzer zzerVar) {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        zzeh.zzj((zzeh) this.zza, i, zzerVar.zzaA());
        return this;
    }

    public final int zzd() {
        return ((zzeh) this.zza).zzg();
    }

    public final zzej zze(int i) {
        return ((zzeh) this.zza).zzh(i);
    }

    public final zzeg zzf(int i, zzei zzeiVar) {
        if (this.zzb) {
            zzax();
            this.zzb = false;
        }
        zzeh.zzk((zzeh) this.zza, i, zzeiVar.zzaA());
        return this;
    }

    /* synthetic */ zzeg(zzef zzefVar) {
        super(zzeh.zzj);
    }
}
