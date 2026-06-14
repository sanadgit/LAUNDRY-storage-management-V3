package com.google.android.gms.internal.measurement;

import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.text.HtmlCompat;
import java.util.Iterator;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbk extends zzaw {
    protected zzbk() {
        this.zza.add(zzbl.ASSIGN);
        this.zza.add(zzbl.CONST);
        this.zza.add(zzbl.CREATE_ARRAY);
        this.zza.add(zzbl.CREATE_OBJECT);
        this.zza.add(zzbl.EXPRESSION_LIST);
        this.zza.add(zzbl.GET);
        this.zza.add(zzbl.GET_INDEX);
        this.zza.add(zzbl.GET_PROPERTY);
        this.zza.add(zzbl.NULL);
        this.zza.add(zzbl.SET_PROPERTY);
        this.zza.add(zzbl.TYPEOF);
        this.zza.add(zzbl.UNDEFINED);
        this.zza.add(zzbl.VAR);
    }

    @Override // com.google.android.gms.internal.measurement.zzaw
    public final zzap zza(String str, zzg zzgVar, List<zzap> list) {
        String str2;
        zzbl zzblVar = zzbl.ADD;
        int i = 0;
        switch (zzh.zze(str).ordinal()) {
            case 3:
                zzh.zza(zzbl.ASSIGN.name(), 2, list);
                zzap zzapVarZza = zzgVar.zza(list.get(0));
                if (!(zzapVarZza instanceof zzat)) {
                    throw new IllegalArgumentException(String.format("Expected string for assign var. got %s", zzapVarZza.getClass().getCanonicalName()));
                }
                if (!zzgVar.zzd(zzapVarZza.zzc())) {
                    throw new IllegalArgumentException(String.format("Attempting to assign undefined value %s", zzapVarZza.zzc()));
                }
                zzap zzapVarZza2 = zzgVar.zza(list.get(1));
                zzgVar.zze(zzapVarZza.zzc(), zzapVarZza2);
                return zzapVarZza2;
            case 14:
                zzh.zzb(zzbl.CONST.name(), 2, list);
                if (list.size() % 2 != 0) {
                    throw new IllegalArgumentException(String.format("CONST requires an even number of arguments, found %s", Integer.valueOf(list.size())));
                }
                for (int i2 = 0; i2 < list.size() - 1; i2 += 2) {
                    zzap zzapVarZza3 = zzgVar.zza(list.get(i2));
                    if (!(zzapVarZza3 instanceof zzat)) {
                        throw new IllegalArgumentException(String.format("Expected string for const name. got %s", zzapVarZza3.getClass().getCanonicalName()));
                    }
                    zzgVar.zzg(zzapVarZza3.zzc(), zzgVar.zza(list.get(i2 + 1)));
                }
                return zzap.zzf;
            case 17:
                if (list.isEmpty()) {
                    return new zzae();
                }
                zzae zzaeVar = new zzae();
                Iterator<zzap> it = list.iterator();
                while (it.hasNext()) {
                    zzap zzapVarZza4 = zzgVar.zza(it.next());
                    if (zzapVarZza4 instanceof zzag) {
                        throw new IllegalStateException("Failed to evaluate array element");
                    }
                    zzaeVar.zzn(i, zzapVarZza4);
                    i++;
                }
                return zzaeVar;
            case 18:
                if (list.isEmpty()) {
                    return new zzam();
                }
                if (list.size() % 2 != 0) {
                    throw new IllegalArgumentException(String.format("CREATE_OBJECT requires an even number of arguments, found %s", Integer.valueOf(list.size())));
                }
                zzam zzamVar = new zzam();
                while (i < list.size() - 1) {
                    zzap zzapVarZza5 = zzgVar.zza(list.get(i));
                    zzap zzapVarZza6 = zzgVar.zza(list.get(i + 1));
                    if ((zzapVarZza5 instanceof zzag) || (zzapVarZza6 instanceof zzag)) {
                        throw new IllegalStateException("Failed to evaluate map entry");
                    }
                    zzamVar.zzm(zzapVarZza5.zzc(), zzapVarZza6);
                    i += 2;
                }
                return zzamVar;
            case 24:
                zzh.zzb(zzbl.EXPRESSION_LIST.name(), 1, list);
                zzap zzapVarZza7 = zzap.zzf;
                while (i < list.size()) {
                    zzapVarZza7 = zzgVar.zza(list.get(i));
                    if (zzapVarZza7 instanceof zzag) {
                        throw new IllegalStateException("ControlValue cannot be in an expression list");
                    }
                    i++;
                }
                return zzapVarZza7;
            case 33:
                zzh.zza(zzbl.GET.name(), 1, list);
                zzap zzapVarZza8 = zzgVar.zza(list.get(0));
                if (zzapVarZza8 instanceof zzat) {
                    return zzgVar.zzh(zzapVarZza8.zzc());
                }
                throw new IllegalArgumentException(String.format("Expected string for get var. got %s", zzapVarZza8.getClass().getCanonicalName()));
            case 35:
            case 36:
                zzh.zza(zzbl.GET_PROPERTY.name(), 2, list);
                zzap zzapVarZza9 = zzgVar.zza(list.get(0));
                zzap zzapVarZza10 = zzgVar.zza(list.get(1));
                if ((zzapVarZza9 instanceof zzae) && zzh.zzd(zzapVarZza10)) {
                    return ((zzae) zzapVarZza9).zzl(zzapVarZza10.zzd().intValue());
                }
                if (zzapVarZza9 instanceof zzal) {
                    return ((zzal) zzapVarZza9).zzk(zzapVarZza10.zzc());
                }
                if (zzapVarZza9 instanceof zzat) {
                    if ("length".equals(zzapVarZza10.zzc())) {
                        return new zzah(Double.valueOf(zzapVarZza9.zzc().length()));
                    }
                    if (zzh.zzd(zzapVarZza10) && zzapVarZza10.zzd().doubleValue() < zzapVarZza9.zzc().length()) {
                        return new zzat(String.valueOf(zzapVarZza9.zzc().charAt(zzapVarZza10.zzd().intValue())));
                    }
                }
                return zzap.zzf;
            case ConstraintLayout.LayoutParams.Table.LAYOUT_EDITOR_ABSOLUTEX /* 49 */:
                zzh.zza(zzbl.NULL.name(), 0, list);
                return zzap.zzg;
            case 58:
                zzh.zza(zzbl.SET_PROPERTY.name(), 3, list);
                zzap zzapVarZza11 = zzgVar.zza(list.get(0));
                zzap zzapVarZza12 = zzgVar.zza(list.get(1));
                zzap zzapVarZza13 = zzgVar.zza(list.get(2));
                if (zzapVarZza11 == zzap.zzf || zzapVarZza11 == zzap.zzg) {
                    throw new IllegalStateException(String.format("Can't set property %s of %s", zzapVarZza12.zzc(), zzapVarZza11.zzc()));
                }
                if ((zzapVarZza11 instanceof zzae) && (zzapVarZza12 instanceof zzah)) {
                    ((zzae) zzapVarZza11).zzn(zzapVarZza12.zzd().intValue(), zzapVarZza13);
                } else if (zzapVarZza11 instanceof zzal) {
                    ((zzal) zzapVarZza11).zzm(zzapVarZza12.zzc(), zzapVarZza13);
                }
                return zzapVarZza13;
            case 62:
                zzh.zza(zzbl.TYPEOF.name(), 1, list);
                zzap zzapVarZza14 = zzgVar.zza(list.get(0));
                if (zzapVarZza14 instanceof zzau) {
                    str2 = "undefined";
                } else if (zzapVarZza14 instanceof zzaf) {
                    str2 = "boolean";
                } else if (zzapVarZza14 instanceof zzah) {
                    str2 = "number";
                } else if (zzapVarZza14 instanceof zzat) {
                    str2 = "string";
                } else if (zzapVarZza14 instanceof zzao) {
                    str2 = "function";
                } else {
                    if ((zzapVarZza14 instanceof zzaq) || (zzapVarZza14 instanceof zzag)) {
                        throw new IllegalArgumentException(String.format("Unsupported value type %s in typeof", zzapVarZza14));
                    }
                    str2 = "object";
                }
                return new zzat(str2);
            case HtmlCompat.FROM_HTML_MODE_COMPACT /* 63 */:
                zzh.zza(zzbl.UNDEFINED.name(), 0, list);
                return zzap.zzf;
            case 64:
                zzh.zzb(zzbl.VAR.name(), 1, list);
                Iterator<zzap> it2 = list.iterator();
                while (it2.hasNext()) {
                    zzap zzapVarZza15 = zzgVar.zza(it2.next());
                    if (!(zzapVarZza15 instanceof zzat)) {
                        throw new IllegalArgumentException(String.format("Expected string for var name. got %s", zzapVarZza15.getClass().getCanonicalName()));
                    }
                    zzgVar.zzf(zzapVarZza15.zzc(), zzap.zzf);
                }
                return zzap.zzf;
            default:
                return super.zzb(str);
        }
    }
}
