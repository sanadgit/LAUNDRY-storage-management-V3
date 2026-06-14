package com.google.android.gms.internal.measurement;

import android.util.Log;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhn extends zzht<Long> {
    zzhn(zzhr zzhrVar, String str, Long l, boolean z) {
        super(zzhrVar, str, l, true, null);
    }

    @Override // com.google.android.gms.internal.measurement.zzht
    final /* bridge */ /* synthetic */ Long zza(Object obj) {
        try {
            return Long.valueOf(Long.parseLong((String) obj));
        } catch (NumberFormatException e) {
            String strZzd = super.zzd();
            String str = (String) obj;
            StringBuilder sb = new StringBuilder(String.valueOf(strZzd).length() + 25 + str.length());
            sb.append("Invalid long value for ");
            sb.append(strZzd);
            sb.append(": ");
            sb.append(str);
            Log.e("PhenotypeFlag", sb.toString());
            return null;
        }
    }
}
