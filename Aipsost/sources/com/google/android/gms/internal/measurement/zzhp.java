package com.google.android.gms.internal.measurement;

import android.util.Log;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhp extends zzht<Double> {
    zzhp(zzhr zzhrVar, String str, Double d, boolean z) {
        super(zzhrVar, "measurement.test.double_flag", d, true, null);
    }

    @Override // com.google.android.gms.internal.measurement.zzht
    final /* bridge */ /* synthetic */ Double zza(Object obj) {
        try {
            return Double.valueOf(Double.parseDouble((String) obj));
        } catch (NumberFormatException e) {
            String strZzd = super.zzd();
            String str = (String) obj;
            StringBuilder sb = new StringBuilder(String.valueOf(strZzd).length() + 27 + str.length());
            sb.append("Invalid double value for ");
            sb.append(strZzd);
            sb.append(": ");
            sb.append(str);
            Log.e("PhenotypeFlag", sb.toString());
            return null;
        }
    }
}
