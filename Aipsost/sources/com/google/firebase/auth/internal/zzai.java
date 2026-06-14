package com.google.firebase.auth.internal;

import android.text.TextUtils;
import com.google.android.gms.common.api.Status;
import com.google.firebase.FirebaseError;
import java.util.Arrays;
import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzai {
    public static Status zza(String str) {
        String str2;
        if (TextUtils.isEmpty(str)) {
            return new Status(FirebaseError.ERROR_INTERNAL_ERROR);
        }
        String[] strArrSplit = str.split(":", 2);
        strArrSplit[0] = strArrSplit[0].trim();
        if (strArrSplit.length > 1 && (str2 = strArrSplit[1]) != null) {
            strArrSplit[1] = str2.trim();
        }
        List listAsList = Arrays.asList(strArrSplit);
        return listAsList.size() > 1 ? zzb((String) listAsList.get(0), (String) listAsList.get(1)) : zzb((String) listAsList.get(0), null);
    }

    /* JADX WARN: Can't fix incorrect switch cases order, some code will duplicate */
    /* JADX WARN: Failed to restore switch over string. Please report as a decompilation issue */
    /* JADX WARN: Removed duplicated region for block: B:239:0x03a1  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    private static com.google.android.gms.common.api.Status zzb(java.lang.String r3, java.lang.String r4) {
        /*
            Method dump skipped, instruction units count: 1716
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.firebase.auth.internal.zzai.zzb(java.lang.String, java.lang.String):com.google.android.gms.common.api.Status");
    }
}
