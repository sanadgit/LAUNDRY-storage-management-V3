package com.google.android.gms.internal.measurement;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzf {
    final zzax zza;
    final zzg zzb;
    final zzg zzc;
    final zzj zzd;

    public zzf() {
        zzax zzaxVar = new zzax();
        this.zza = zzaxVar;
        zzg zzgVar = new zzg(null, zzaxVar);
        this.zzc = zzgVar;
        this.zzb = zzgVar.zzc();
        zzj zzjVar = new zzj();
        this.zzd = zzjVar;
        zzgVar.zze("require", new zzv(zzjVar));
        zzjVar.zza("internal.platform", zze.zza);
        zzgVar.zze("runtime.counter", new zzah(Double.valueOf(0.0d)));
    }

    public final zzap zza(zzg zzgVar, zzgt... zzgtVarArr) {
        zzap zzapVarZzb = zzap.zzf;
        for (zzgt zzgtVar : zzgtVarArr) {
            zzapVarZzb = zzi.zzb(zzgtVar);
            zzh.zzk(this.zzc);
            if ((zzapVarZzb instanceof zzaq) || (zzapVarZzb instanceof zzao)) {
                zzapVarZzb = this.zza.zzb(zzgVar, zzapVarZzb);
            }
        }
        return zzapVarZzb;
    }
}
