package com.google.firebase.auth.internal;

import android.text.TextUtils;
import android.util.Log;
import com.google.android.gms.safetynet.SafetyNetApi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbf {
    private static final String zza = zzbf.class.getSimpleName();

    private zzbf() {
    }

    public static boolean zza(SafetyNetApi.AttestationResponse attestationResponse) {
        if (attestationResponse == null || TextUtils.isEmpty(attestationResponse.getJwsResult())) {
            Log.e(zza, "No SafetyNet AttestationResponse passed.");
            return false;
        }
        zzbe zzbeVarZza = zzbe.zza(attestationResponse.getJwsResult());
        if (zzbeVarZza == null) {
            Log.e(zza, "Unable to parse SafetyNet AttestationResponse");
            return false;
        }
        if (!zzbeVarZza.zzc()) {
            Log.e(zza, "SafetyNet Attestation fails basic integrity.");
            return false;
        }
        if (TextUtils.isEmpty(zzbeVarZza.zzb())) {
            return true;
        }
        Log.e(zza, "SafetyNet Attestation has advice: \n".concat(String.valueOf(zzbeVarZza.zzb())));
        return false;
    }
}
