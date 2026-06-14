package com.google.android.gms.internal.measurement;

import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzh {
    public static void zza(String str, int i, List<zzap> list) {
        if (list.size() != i) {
            throw new IllegalArgumentException(String.format("%s operation requires %s parameters found %s", str, Integer.valueOf(i), Integer.valueOf(list.size())));
        }
    }

    public static void zzb(String str, int i, List<zzap> list) {
        if (list.size() < i) {
            throw new IllegalArgumentException(String.format("%s operation requires at least %s parameters found %s", str, Integer.valueOf(i), Integer.valueOf(list.size())));
        }
    }

    public static void zzc(String str, int i, List<zzap> list) {
        if (list.size() > i) {
            throw new IllegalArgumentException(String.format("%s operation requires at most %s parameters found %s", str, Integer.valueOf(i), Integer.valueOf(list.size())));
        }
    }

    public static boolean zzd(zzap zzapVar) {
        if (zzapVar == null) {
            return false;
        }
        Double dZzd = zzapVar.zzd();
        return !dZzd.isNaN() && dZzd.doubleValue() >= 0.0d && dZzd.equals(Double.valueOf(Math.floor(dZzd.doubleValue())));
    }

    public static zzbl zze(String str) {
        zzbl zzblVarZza = null;
        if (str != null && !str.isEmpty()) {
            zzblVarZza = zzbl.zza(Integer.parseInt(str));
        }
        if (zzblVarZza != null) {
            return zzblVarZza;
        }
        throw new IllegalArgumentException(String.format("Unsupported commandId %s", str));
    }

    public static boolean zzf(zzap zzapVar, zzap zzapVar2) {
        if (!zzapVar.getClass().equals(zzapVar2.getClass())) {
            return false;
        }
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

    public static int zzg(double d) {
        if (Double.isNaN(d) || Double.isInfinite(d) || d == 0.0d) {
            return 0;
        }
        return (int) ((((double) (d > 0.0d ? 1 : -1)) * Math.floor(Math.abs(d))) % 4.294967296E9d);
    }

    public static long zzh(double d) {
        return ((long) zzg(d)) & 4294967295L;
    }

    public static double zzi(double d) {
        if (Double.isNaN(d)) {
            return 0.0d;
        }
        if (Double.isInfinite(d) || d == 0.0d || d == 0.0d) {
            return d;
        }
        return ((double) (d > 0.0d ? 1 : -1)) * Math.floor(Math.abs(d));
    }

    public static Object zzj(zzap zzapVar) {
        if (zzap.zzg.equals(zzapVar)) {
            return null;
        }
        return zzap.zzf.equals(zzapVar) ? "" : !zzapVar.zzd().isNaN() ? zzapVar.zzd() : zzapVar.zzc();
    }

    public static int zzk(zzg zzgVar) {
        int iZzg = zzg(zzgVar.zzh("runtime.counter").zzd().doubleValue() + 1.0d);
        if (iZzg > 1000000) {
            throw new IllegalStateException("Instructions allowed exceeded");
        }
        zzgVar.zze("runtime.counter", new zzah(Double.valueOf(iZzg)));
        return iZzg;
    }
}
