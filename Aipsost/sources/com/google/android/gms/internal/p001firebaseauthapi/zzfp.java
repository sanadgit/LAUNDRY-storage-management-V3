package com.google.android.gms.internal.p001firebaseauthapi;

import android.os.Build;
import android.util.Log;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.util.Arrays;
import java.util.Locale;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfp implements zzbk {
    private static final String zza = zzfp.class.getSimpleName();
    private KeyStore zzb;

    public zzfp() throws GeneralSecurityException {
        if (Build.VERSION.SDK_INT < 23) {
            throw new IllegalStateException("need Android Keystore on Android M or newer");
        }
        try {
            KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
            keyStore.load(null);
            this.zzb = keyStore;
        } catch (IOException | GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbk
    public final synchronized zzap zza(String str) throws GeneralSecurityException {
        zzfo zzfoVar;
        zzfoVar = new zzfo(zzqs.zza("android-keystore://", str), this.zzb);
        byte[] bArrZza = zzqq.zza(10);
        byte[] bArr = new byte[0];
        if (!Arrays.equals(bArrZza, zzfoVar.zza(zzfoVar.zzb(bArrZza, bArr), bArr))) {
            throw new KeyStoreException("cannot use Android Keystore: encryption/decryption of non-empty message and empty aad returns an incorrect result");
        }
        return zzfoVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbk
    public final synchronized boolean zzb(String str) {
        return str.toLowerCase(Locale.US).startsWith("android-keystore://");
    }

    final synchronized boolean zzc(String str) throws GeneralSecurityException {
        String strZza;
        strZza = zzqs.zza("android-keystore://", str);
        try {
        } catch (NullPointerException e) {
            Log.w(zza, "Keystore is temporarily unavailable, wait 20ms, reinitialize Keystore and try again.");
            try {
                Thread.sleep(20L);
                KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
                this.zzb = keyStore;
                keyStore.load(null);
            } catch (IOException e2) {
                throw new GeneralSecurityException(e2);
            } catch (InterruptedException e3) {
            }
            return this.zzb.containsAlias(strZza);
        }
        return this.zzb.containsAlias(strZza);
    }
}
