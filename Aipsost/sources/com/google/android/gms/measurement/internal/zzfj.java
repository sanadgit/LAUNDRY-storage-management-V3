package com.google.android.gms.measurement.internal;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfj implements com.google.android.gms.internal.measurement.zzr {
    final /* synthetic */ zzfl zza;

    zzfj(zzfl zzflVar) {
        this.zza = zzflVar;
    }

    @Override // com.google.android.gms.internal.measurement.zzr
    public final void zza(int i, String str, List<String> list, boolean z, boolean z2) {
        zzek zzekVarZzj;
        switch (i - 1) {
            case 0:
                zzekVarZzj = this.zza.zzs.zzau().zzj();
                break;
            case 1:
                zzekVarZzj = !z ? !z2 ? this.zza.zzs.zzau().zzd() : this.zza.zzs.zzau().zzb() : this.zza.zzs.zzau().zzc();
                break;
            case 2:
            default:
                zzekVarZzj = this.zza.zzs.zzau().zzi();
                break;
            case 3:
                zzekVarZzj = this.zza.zzs.zzau().zzk();
                break;
            case 4:
                zzekVarZzj = !z ? !z2 ? this.zza.zzs.zzau().zzh() : this.zza.zzs.zzau().zze() : this.zza.zzs.zzau().zzf();
                break;
        }
        switch (list.size()) {
            case 1:
                zzekVarZzj.zzb(str, list.get(0));
                break;
            case 2:
                zzekVarZzj.zzc(str, list.get(0), list.get(1));
                break;
            case 3:
                zzekVarZzj.zzd(str, list.get(0), list.get(1), list.get(2));
                break;
            default:
                zzekVarZzj.zza(str);
                break;
        }
    }
}
