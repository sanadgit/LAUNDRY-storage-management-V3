package com.google.firebase.auth.internal;

import android.content.Context;
import android.util.Base64;
import android.util.Log;
import com.bumptech.glide.load.Key;
import com.google.android.gms.internal.p001firebaseauthapi.zzei;
import com.google.android.gms.internal.p001firebaseauthapi.zzen;
import com.google.android.gms.internal.p001firebaseauthapi.zzfl;
import com.google.android.gms.internal.p001firebaseauthapi.zzfn;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzk {
    private static zzk zza;
    private final String zzb;
    private final zzfn zzc;

    private zzk(Context context, String str, boolean z) {
        zzfn zzfnVarZzg;
        this.zzb = str;
        try {
            zzei.zza();
            zzfl zzflVar = new zzfl();
            zzflVar.zzf(context, "GenericIdpKeyset", String.format("com.google.firebase.auth.api.crypto.%s", str));
            zzflVar.zzd(zzen.zza);
            zzflVar.zze(String.format("android-keystore://firebear_master_key_id.%s", str));
            zzfnVarZzg = zzflVar.zzg();
        } catch (IOException | GeneralSecurityException e) {
            Log.e("FirebearCryptoHelper", "Exception encountered during crypto setup:\n".concat(String.valueOf(e.getMessage())));
            zzfnVarZzg = null;
        }
        this.zzc = zzfnVarZzg;
    }

    public static zzk zza(Context context, String str) {
        zzk zzkVar = zza;
        if (zzkVar == null || !com.google.android.gms.internal.p001firebaseauthapi.zzu.zza(zzkVar.zzb, str)) {
            zza = new zzk(context, str, true);
        }
        return zza;
    }

    public final String zzb(String str) {
        String str2;
        zzfn zzfnVar = this.zzc;
        if (zzfnVar == null) {
            Log.e("FirebearCryptoHelper", "KeysetManager failed to initialize - unable to decrypt payload");
            return null;
        }
        try {
            synchronized (zzfnVar) {
                str2 = new String(((com.google.android.gms.internal.p001firebaseauthapi.zzau) this.zzc.zza().zze(com.google.android.gms.internal.p001firebaseauthapi.zzau.class)).zza(Base64.decode(str, 8), null), Key.STRING_CHARSET_NAME);
            }
            return str2;
        } catch (UnsupportedEncodingException | GeneralSecurityException e) {
            Log.e("FirebearCryptoHelper", "Exception encountered while decrypting bytes:\n".concat(String.valueOf(e.getMessage())));
            return null;
        }
    }

    public final String zzc() {
        if (this.zzc == null) {
            Log.e("FirebearCryptoHelper", "KeysetManager failed to initialize - unable to get Public key");
            return null;
        }
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        com.google.android.gms.internal.p001firebaseauthapi.zzbj zzbjVarZza = com.google.android.gms.internal.p001firebaseauthapi.zzaq.zza(byteArrayOutputStream);
        try {
            synchronized (this.zzc) {
                this.zzc.zza().zzb().zzg(zzbjVarZza);
            }
            return Base64.encodeToString(byteArrayOutputStream.toByteArray(), 8);
        } catch (IOException | GeneralSecurityException e) {
            Log.e("FirebearCryptoHelper", "Exception encountered when attempting to get Public Key:\n".concat(String.valueOf(e.getMessage())));
            return null;
        }
    }
}
