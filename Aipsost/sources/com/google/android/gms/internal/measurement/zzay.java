package com.google.android.gms.internal.measurement;

import androidx.constraintlayout.widget.ConstraintLayout;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzay extends zzaw {
    public zzay() {
        this.zza.add(zzbl.EQUALS);
        this.zza.add(zzbl.GREATER_THAN);
        this.zza.add(zzbl.GREATER_THAN_EQUALS);
        this.zza.add(zzbl.IDENTITY_EQUALS);
        this.zza.add(zzbl.IDENTITY_NOT_EQUALS);
        this.zza.add(zzbl.LESS_THAN);
        this.zza.add(zzbl.LESS_THAN_EQUALS);
        this.zza.add(zzbl.NOT_EQUALS);
    }

    private static boolean zzc(zzap zzapVar, zzap zzapVar2) {
        if (zzapVar instanceof zzal) {
            zzapVar = new zzat(zzapVar.zzc());
        }
        if (zzapVar2 instanceof zzal) {
            zzapVar2 = new zzat(zzapVar2.zzc());
        }
        if ((zzapVar instanceof zzat) && (zzapVar2 instanceof zzat)) {
            return zzapVar.zzc().compareTo(zzapVar2.zzc()) < 0;
        }
        double dDoubleValue = zzapVar.zzd().doubleValue();
        double dDoubleValue2 = zzapVar2.zzd().doubleValue();
        return (Double.isNaN(dDoubleValue) || Double.isNaN(dDoubleValue2) || Double.compare(dDoubleValue, dDoubleValue2) >= 0) ? false : true;
    }

    private static boolean zzd(zzap zzapVar, zzap zzapVar2) {
        if (zzapVar.getClass().equals(zzapVar2.getClass())) {
            if ((zzapVar instanceof zzau) || (zzapVar instanceof zzan)) {
                return true;
            }
            if (!(zzapVar instanceof zzah)) {
                return zzapVar instanceof zzat ? zzapVar.zzc().equals(zzapVar2.zzc()) : zzapVar instanceof zzaf ? zzapVar.zze().equals(zzapVar2.zze()) : zzapVar == zzapVar2;
            }
            if (Double.isNaN(zzapVar.zzd().doubleValue()) || Double.isNaN(zzapVar2.zzd().doubleValue())) {
                return false;
            }
            return zzapVar.zzd().equals(zzapVar2.zzd());
        }
        if (((zzapVar instanceof zzau) || (zzapVar instanceof zzan)) && ((zzapVar2 instanceof zzau) || (zzapVar2 instanceof zzan))) {
            return true;
        }
        boolean z = zzapVar instanceof zzah;
        if (z && (zzapVar2 instanceof zzat)) {
            return zzd(zzapVar, new zzah(zzapVar2.zzd()));
        }
        boolean z2 = zzapVar instanceof zzat;
        if (z2 && (zzapVar2 instanceof zzah)) {
            return zzd(new zzah(zzapVar.zzd()), zzapVar2);
        }
        if (zzapVar instanceof zzaf) {
            return zzd(new zzah(zzapVar.zzd()), zzapVar2);
        }
        if (zzapVar2 instanceof zzaf) {
            return zzd(zzapVar, new zzah(zzapVar2.zzd()));
        }
        if ((z2 || z) && (zzapVar2 instanceof zzal)) {
            return zzd(zzapVar, new zzat(zzapVar2.zzc()));
        }
        if ((zzapVar instanceof zzal) && ((zzapVar2 instanceof zzat) || (zzapVar2 instanceof zzah))) {
            return zzd(new zzat(zzapVar.zzc()), zzapVar2);
        }
        return false;
    }

    private static boolean zze(zzap zzapVar, zzap zzapVar2) {
        if (zzapVar instanceof zzal) {
            zzapVar = new zzat(zzapVar.zzc());
        }
        if (zzapVar2 instanceof zzal) {
            zzapVar2 = new zzat(zzapVar2.zzc());
        }
        return (((zzapVar instanceof zzat) && (zzapVar2 instanceof zzat)) || !(Double.isNaN(zzapVar.zzd().doubleValue()) || Double.isNaN(zzapVar2.zzd().doubleValue()))) && !zzc(zzapVar2, zzapVar);
    }

    @Override // com.google.android.gms.internal.measurement.zzaw
    public final zzap zza(String str, zzg zzgVar, List<zzap> list) {
        boolean zZzd;
        zzh.zza(zzh.zze(str).name(), 2, list);
        zzap zzapVarZza = zzgVar.zza(list.get(0));
        zzap zzapVarZza2 = zzgVar.zza(list.get(1));
        switch (zzh.zze(str).ordinal()) {
            case 23:
                zZzd = zzd(zzapVarZza, zzapVarZza2);
                break;
            case 37:
                zZzd = zzc(zzapVarZza2, zzapVarZza);
                break;
            case 38:
                zZzd = zze(zzapVarZza2, zzapVarZza);
                break;
            case 39:
                zZzd = zzh.zzf(zzapVarZza, zzapVarZza2);
                break;
            case 40:
                zZzd = !zzh.zzf(zzapVarZza, zzapVarZza2);
                break;
            case 42:
                zZzd = zzc(zzapVarZza, zzapVarZza2);
                break;
            case 43:
                zZzd = zze(zzapVarZza, zzapVarZza2);
                break;
            case ConstraintLayout.LayoutParams.Table.LAYOUT_CONSTRAINT_VERTICAL_CHAINSTYLE /* 48 */:
                zZzd = !zzd(zzapVarZza, zzapVarZza2);
                break;
            default:
                return super.zzb(str);
        }
        return zZzd ? zzap.zzk : zzap.zzl;
    }
}
