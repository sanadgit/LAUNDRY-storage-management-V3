package com.google.android.gms.internal.measurement;

import android.util.Log;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzho extends zzht<Boolean> {
    zzho(zzhr zzhrVar, String str, Boolean bool, boolean z) {
        super(zzhrVar, str, bool, true, null);
    }

    /* JADX WARN: Multi-variable type inference failed */
    @Override // com.google.android.gms.internal.measurement.zzht
    final /* bridge */ /* synthetic */ Boolean zza(Object obj) {
        if (zzgv.zzc.matcher(obj).matches()) {
            return true;
        }
        if (zzgv.zzd.matcher(obj).matches()) {
            return false;
        }
        String strZzd = super.zzd();
        String str = (String) obj;
        StringBuilder sb = new StringBuilder(String.valueOf(strZzd).length() + 28 + str.length());
        sb.append("Invalid boolean value for ");
        sb.append(strZzd);
        sb.append(": ");
        sb.append(str);
        Log.e("PhenotypeFlag", sb.toString());
        return null;
    }
}
