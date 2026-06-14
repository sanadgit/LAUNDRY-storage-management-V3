package com.google.android.gms.internal.p001firebaseauthapi;

import com.bumptech.glide.load.Key;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.util.Base64Utils;
import java.io.UnsupportedEncodingException;
import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaaa {
    public static long zza(String str) {
        Preconditions.checkNotEmpty(str);
        List listZzd = zzaf.zzb('.').zzd(str);
        if (listZzd.size() < 2) {
            throw new RuntimeException("Invalid idToken ".concat(String.valueOf(str)));
        }
        try {
            zzaab zzaabVarZza = zzaab.zza(new String(Base64Utils.decodeUrlSafeNoPadding((String) listZzd.get(1)), Key.STRING_CHARSET_NAME));
            return zzaabVarZza.zzb().longValue() - zzaabVarZza.zzc().longValue();
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Unable to decode token", e);
        }
    }
}
