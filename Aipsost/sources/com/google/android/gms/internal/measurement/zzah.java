package com.google.android.gms.internal.measurement;

import androidx.exifinterface.media.ExifInterface;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.util.Iterator;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzah implements zzap {
    private final Double zza;

    public zzah(Double d) {
        this.zza = d == null ? Double.valueOf(Double.NaN) : d;
    }

    public final boolean equals(Object obj) {
        if (obj == this) {
            return true;
        }
        if (obj instanceof zzah) {
            return this.zza.equals(((zzah) obj).zza);
        }
        return false;
    }

    public final int hashCode() {
        return this.zza.hashCode();
    }

    public final String toString() {
        return zzc();
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final zzap zzbK(String str, zzg zzgVar, List<zzap> list) {
        if ("toString".equals(str)) {
            return new zzat(zzc());
        }
        throw new IllegalArgumentException(String.format("%s.%s is not a function.", zzc(), str));
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final String zzc() {
        if (Double.isNaN(this.zza.doubleValue())) {
            return "NaN";
        }
        if (Double.isInfinite(this.zza.doubleValue())) {
            return this.zza.doubleValue() > 0.0d ? "Infinity" : "-Infinity";
        }
        BigDecimal bigDecimalStripTrailingZeros = BigDecimal.valueOf(this.zza.doubleValue()).stripTrailingZeros();
        DecimalFormat decimalFormat = new DecimalFormat("0E0");
        decimalFormat.setRoundingMode(RoundingMode.HALF_UP);
        decimalFormat.setMinimumFractionDigits(bigDecimalStripTrailingZeros.scale() > 0 ? bigDecimalStripTrailingZeros.precision() - 1 : bigDecimalStripTrailingZeros.scale() - 1);
        String str = decimalFormat.format(bigDecimalStripTrailingZeros);
        int iIndexOf = str.indexOf(ExifInterface.LONGITUDE_EAST);
        if (iIndexOf <= 0) {
            return str;
        }
        int i = Integer.parseInt(str.substring(iIndexOf + 1));
        return ((i >= 0 || i <= -7) && (i < 0 || i >= 21)) ? str.replace("E-", "e-").replace(ExifInterface.LONGITUDE_EAST, "e+") : bigDecimalStripTrailingZeros.toPlainString();
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final Double zzd() {
        return this.zza;
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final Boolean zze() {
        boolean z = false;
        if (!Double.isNaN(this.zza.doubleValue()) && this.zza.doubleValue() != 0.0d) {
            z = true;
        }
        return Boolean.valueOf(z);
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final Iterator<zzap> zzf() {
        return null;
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final zzap zzt() {
        return new zzah(this.zza);
    }
}
