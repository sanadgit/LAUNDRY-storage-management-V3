package com.google.android.gms.measurement.internal;

import com.google.android.gms.common.internal.Preconditions;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.regex.PatternSyntaxException;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
abstract class zzw {
    final String zzb;
    final int zzc;
    Boolean zzd;
    Boolean zze;
    Long zzf;
    Long zzg;

    zzw(String str, int i) {
        this.zzb = str;
        this.zzc = i;
    }

    private static Boolean zzd(String str, com.google.android.gms.internal.measurement.zzew zzewVar, boolean z, String str2, List<String> list, String str3, zzem zzemVar) {
        if (zzewVar == com.google.android.gms.internal.measurement.zzew.IN_LIST) {
            if (list == null || list.size() == 0) {
                return null;
            }
        } else if (str2 == null) {
            return null;
        }
        if (!z && zzewVar != com.google.android.gms.internal.measurement.zzew.REGEXP) {
            str = str.toUpperCase(Locale.ENGLISH);
        }
        com.google.android.gms.internal.measurement.zzep zzepVar = com.google.android.gms.internal.measurement.zzep.UNKNOWN_COMPARISON_TYPE;
        switch (zzewVar.ordinal()) {
            case 1:
                if (str3 != null) {
                    try {
                    } catch (PatternSyntaxException e) {
                        if (zzemVar != null) {
                            zzemVar.zze().zzb("Invalid regular expression in REGEXP audience filter. expression", str3);
                        }
                        return null;
                    }
                    break;
                }
                break;
            case 6:
                if (list != null) {
                    break;
                }
                break;
        }
        return null;
    }

    static Boolean zze(Boolean bool, boolean z) {
        if (bool == null) {
            return null;
        }
        return Boolean.valueOf(bool.booleanValue() != z);
    }

    static Boolean zzf(String str, com.google.android.gms.internal.measurement.zzex zzexVar, zzem zzemVar) {
        List<String> listUnmodifiableList;
        Preconditions.checkNotNull(zzexVar);
        if (str == null || !zzexVar.zza() || zzexVar.zzb() == com.google.android.gms.internal.measurement.zzew.UNKNOWN_MATCH_TYPE) {
            return null;
        }
        if (zzexVar.zzb() == com.google.android.gms.internal.measurement.zzew.IN_LIST) {
            if (zzexVar.zzh() == 0) {
                return null;
            }
        } else if (!zzexVar.zzc()) {
            return null;
        }
        com.google.android.gms.internal.measurement.zzew zzewVarZzb = zzexVar.zzb();
        boolean zZzf = zzexVar.zzf();
        String strZzd = (zZzf || zzewVarZzb == com.google.android.gms.internal.measurement.zzew.REGEXP || zzewVarZzb == com.google.android.gms.internal.measurement.zzew.IN_LIST) ? zzexVar.zzd() : zzexVar.zzd().toUpperCase(Locale.ENGLISH);
        if (zzexVar.zzh() == 0) {
            listUnmodifiableList = null;
        } else {
            List<String> listZzg = zzexVar.zzg();
            if (zZzf) {
                listUnmodifiableList = listZzg;
            } else {
                ArrayList arrayList = new ArrayList(listZzg.size());
                Iterator<String> it = listZzg.iterator();
                while (it.hasNext()) {
                    arrayList.add(it.next().toUpperCase(Locale.ENGLISH));
                }
                listUnmodifiableList = Collections.unmodifiableList(arrayList);
            }
        }
        return zzd(str, zzewVarZzb, zZzf, strZzd, listUnmodifiableList, zzewVarZzb == com.google.android.gms.internal.measurement.zzew.REGEXP ? strZzd : null, zzemVar);
    }

    static Boolean zzg(long j, com.google.android.gms.internal.measurement.zzeq zzeqVar) {
        try {
            return zzj(new BigDecimal(j), zzeqVar, 0.0d);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    static Boolean zzh(double d, com.google.android.gms.internal.measurement.zzeq zzeqVar) {
        try {
            return zzj(new BigDecimal(d), zzeqVar, Math.ulp(d));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    static Boolean zzi(String str, com.google.android.gms.internal.measurement.zzeq zzeqVar) {
        if (!zzkp.zzl(str)) {
            return null;
        }
        try {
            return zzj(new BigDecimal(str), zzeqVar, 0.0d);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    static Boolean zzj(BigDecimal bigDecimal, com.google.android.gms.internal.measurement.zzeq zzeqVar, double d) {
        BigDecimal bigDecimal2;
        BigDecimal bigDecimal3;
        BigDecimal bigDecimal4;
        Preconditions.checkNotNull(zzeqVar);
        if (!zzeqVar.zza() || zzeqVar.zzb() == com.google.android.gms.internal.measurement.zzep.UNKNOWN_COMPARISON_TYPE) {
            return null;
        }
        if (zzeqVar.zzb() == com.google.android.gms.internal.measurement.zzep.BETWEEN) {
            if (!zzeqVar.zzg() || !zzeqVar.zzi()) {
                return null;
            }
        } else if (!zzeqVar.zze()) {
            return null;
        }
        com.google.android.gms.internal.measurement.zzep zzepVarZzb = zzeqVar.zzb();
        if (zzeqVar.zzb() == com.google.android.gms.internal.measurement.zzep.BETWEEN) {
            if (!zzkp.zzl(zzeqVar.zzh()) || !zzkp.zzl(zzeqVar.zzj())) {
                return null;
            }
            try {
                BigDecimal bigDecimal5 = new BigDecimal(zzeqVar.zzh());
                bigDecimal4 = new BigDecimal(zzeqVar.zzj());
                bigDecimal3 = bigDecimal5;
                bigDecimal2 = null;
            } catch (NumberFormatException e) {
                return null;
            }
        } else {
            if (!zzkp.zzl(zzeqVar.zzf())) {
                return null;
            }
            try {
                bigDecimal2 = new BigDecimal(zzeqVar.zzf());
                bigDecimal3 = null;
                bigDecimal4 = null;
            } catch (NumberFormatException e2) {
                return null;
            }
        }
        if (zzepVarZzb == com.google.android.gms.internal.measurement.zzep.BETWEEN) {
            if (bigDecimal3 == null) {
                return null;
            }
        } else if (bigDecimal2 == null) {
            return null;
        }
        com.google.android.gms.internal.measurement.zzew zzewVar = com.google.android.gms.internal.measurement.zzew.UNKNOWN_MATCH_TYPE;
        switch (zzepVarZzb.ordinal()) {
            case 1:
                if (bigDecimal2 == null) {
                    return null;
                }
                return Boolean.valueOf(bigDecimal.compareTo(bigDecimal2) < 0);
            case 2:
                if (bigDecimal2 == null) {
                    return null;
                }
                return Boolean.valueOf(bigDecimal.compareTo(bigDecimal2) > 0);
            case 3:
                if (bigDecimal2 == null) {
                    return null;
                }
                if (d != 0.0d) {
                    return Boolean.valueOf(bigDecimal.compareTo(bigDecimal2.subtract(new BigDecimal(d).multiply(new BigDecimal(2)))) > 0 && bigDecimal.compareTo(bigDecimal2.add(new BigDecimal(d).multiply(new BigDecimal(2)))) < 0);
                }
                return Boolean.valueOf(bigDecimal.compareTo(bigDecimal2) == 0);
            case 4:
                if (bigDecimal3 != null) {
                    return Boolean.valueOf(bigDecimal.compareTo(bigDecimal3) >= 0 && bigDecimal.compareTo(bigDecimal4) <= 0);
                }
                return null;
            default:
                return null;
        }
    }

    abstract int zza();

    abstract boolean zzb();

    abstract boolean zzc();
}
