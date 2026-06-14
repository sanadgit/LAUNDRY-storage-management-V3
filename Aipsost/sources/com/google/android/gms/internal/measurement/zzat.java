package com.google.android.gms.internal.measurement;

import java.util.Iterator;
import kotlin.text.Typography;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzat implements Iterable<zzap>, zzap {
    private final String zza;

    public zzat(String str) {
        if (str == null) {
            throw new IllegalArgumentException("StringValue cannot be null.");
        }
        this.zza = str;
    }

    public final boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof zzat) {
            return this.zza.equals(((zzat) obj).zza);
        }
        return false;
    }

    public final int hashCode() {
        return this.zza.hashCode();
    }

    @Override // java.lang.Iterable
    public final Iterator<zzap> iterator() {
        return new zzas(this);
    }

    public final String toString() {
        String str = this.zza;
        StringBuilder sb = new StringBuilder(str.length() + 2);
        sb.append(Typography.quote);
        sb.append(str);
        sb.append(Typography.quote);
        return sb.toString();
    }

    /* JADX WARN: Multi-variable type inference failed */
    /* JADX WARN: Removed duplicated region for block: B:188:0x0476 A[PHI: r19
  0x0476: PHI (r19v3 java.lang.String) = (r19v0 java.lang.String), (r19v4 java.lang.String) binds: [B:184:0x0451, B:186:0x0467] A[DONT_GENERATE, DONT_INLINE]] */
    @Override // com.google.android.gms.internal.measurement.zzap
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final com.google.android.gms.internal.measurement.zzap zzbK(java.lang.String r23, com.google.android.gms.internal.measurement.zzg r24, java.util.List<com.google.android.gms.internal.measurement.zzap> r25) {
        /*
            Method dump skipped, instruction units count: 1848
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.measurement.zzat.zzbK(java.lang.String, com.google.android.gms.internal.measurement.zzg, java.util.List):com.google.android.gms.internal.measurement.zzap");
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final String zzc() {
        return this.zza;
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final Double zzd() {
        if (this.zza.isEmpty()) {
            return Double.valueOf(0.0d);
        }
        try {
            return Double.valueOf(this.zza);
        } catch (NumberFormatException e) {
            return Double.valueOf(Double.NaN);
        }
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final Boolean zze() {
        return Boolean.valueOf(!this.zza.isEmpty());
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final Iterator<zzap> zzf() {
        return new zzar(this);
    }

    @Override // com.google.android.gms.internal.measurement.zzap
    public final zzap zzt() {
        return new zzat(this.zza);
    }
}
