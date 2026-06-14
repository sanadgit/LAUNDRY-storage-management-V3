package com.google.android.gms.internal.p001firebaseauthapi;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import java.io.IOException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfr implements zzbj {
    private final SharedPreferences.Editor zza;
    private final String zzb = "GenericIdpKeyset";

    public zzfr(Context context, String str, String str2) {
        Context applicationContext = context.getApplicationContext();
        if (str2 == null) {
            this.zza = PreferenceManager.getDefaultSharedPreferences(applicationContext).edit();
        } else {
            this.zza = applicationContext.getSharedPreferences(str2, 0).edit();
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbj
    public final void zzb(zzmo zzmoVar) throws IOException {
        if (!this.zza.putString(this.zzb, zzqj.zza(zzmoVar.zzq())).commit()) {
            throw new IOException("Failed to write to SharedPreferences");
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbj
    public final void zzc(zzof zzofVar) throws IOException {
        if (!this.zza.putString(this.zzb, zzqj.zza(zzofVar.zzq())).commit()) {
            throw new IOException("Failed to write to SharedPreferences");
        }
    }
}
