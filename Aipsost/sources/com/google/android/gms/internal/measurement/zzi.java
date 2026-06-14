package com.google.android.gms.internal.measurement;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzi {
    public static zzap zza(Object obj) {
        if (obj == null) {
            return zzap.zzg;
        }
        if (obj instanceof String) {
            return new zzat((String) obj);
        }
        if (obj instanceof Double) {
            return new zzah((Double) obj);
        }
        if (obj instanceof Long) {
            return new zzah(Double.valueOf(((Long) obj).doubleValue()));
        }
        if (obj instanceof Integer) {
            return new zzah(Double.valueOf(((Integer) obj).doubleValue()));
        }
        if (obj instanceof Boolean) {
            return new zzaf((Boolean) obj);
        }
        throw new IllegalArgumentException("Invalid value type");
    }

    public static zzap zzb(zzgt zzgtVar) {
        if (zzgtVar == null) {
            return zzap.zzf;
        }
        zzgs zzgsVar = zzgs.UNKNOWN;
        switch (zzgtVar.zza()) {
            case UNKNOWN:
                throw new IllegalArgumentException("Unknown type found. Cannot convert entity");
            case STRING:
                return zzgtVar.zzd() ? new zzat(zzgtVar.zze()) : zzap.zzm;
            case NUMBER:
                return zzgtVar.zzh() ? new zzah(Double.valueOf(zzgtVar.zzi())) : new zzah(null);
            case BOOLEAN:
                return zzgtVar.zzf() ? new zzaf(Boolean.valueOf(zzgtVar.zzg())) : new zzaf(null);
            case STATEMENT:
                List<zzgt> listZzb = zzgtVar.zzb();
                ArrayList arrayList = new ArrayList();
                Iterator<zzgt> it = listZzb.iterator();
                while (it.hasNext()) {
                    arrayList.add(zzb(it.next()));
                }
                return new zzaq(zzgtVar.zzc(), arrayList);
            default:
                String strValueOf = String.valueOf(zzgtVar);
                StringBuilder sb = new StringBuilder(String.valueOf(strValueOf).length() + 16);
                sb.append("Invalid entity: ");
                sb.append(strValueOf);
                throw new IllegalStateException(sb.toString());
        }
    }
}
