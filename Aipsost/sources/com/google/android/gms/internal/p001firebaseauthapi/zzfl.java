package com.google.android.gms.internal.p001firebaseauthapi;

import android.content.Context;
import android.os.Build;
import android.security.keystore.KeyGenParameterSpec;
import android.util.Log;
import com.google.android.gms.stats.CodePackage;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.KeyStoreException;
import java.security.ProviderException;
import javax.crypto.KeyGenerator;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzfl {
    private zzbi zze;
    private zzfq zzf = null;
    private zzbj zza = null;
    private String zzb = null;
    private zzap zzc = null;
    private zzbf zzd = null;

    private final zzap zzh() throws GeneralSecurityException {
        if (Build.VERSION.SDK_INT < 23) {
            Log.w(zzfn.zzb, "Android Keystore requires at least Android M");
            return null;
        }
        zzfp zzfpVar = new zzfp();
        boolean zZzc = zzfpVar.zzc(this.zzb);
        if (!zZzc) {
            try {
                String str = this.zzb;
                if (new zzfp().zzc(str)) {
                    throw new IllegalArgumentException(String.format("cannot generate a new key %s because it already exists; please delete it with deleteKey() and try again", str));
                }
                String strZza = zzqs.zza("android-keystore://", str);
                KeyGenerator keyGenerator = KeyGenerator.getInstance("AES", "AndroidKeyStore");
                keyGenerator.init(new KeyGenParameterSpec.Builder(strZza, 3).setKeySize(256).setBlockModes(CodePackage.GCM).setEncryptionPaddings("NoPadding").build());
                keyGenerator.generateKey();
            } catch (GeneralSecurityException | ProviderException e) {
                Log.w(zzfn.zzb, "cannot use Android Keystore, it'll be disabled", e);
                return null;
            }
        }
        try {
            return zzfpVar.zza(this.zzb);
        } catch (GeneralSecurityException | ProviderException e2) {
            if (zZzc) {
                throw new KeyStoreException(String.format("the master key %s exists but is unusable", this.zzb), e2);
            }
            Log.w(zzfn.zzb, "cannot use Android Keystore, it'll be disabled", e2);
            return null;
        }
    }

    private final zzbi zzi() throws GeneralSecurityException, IOException {
        zzap zzapVar = this.zzc;
        if (zzapVar != null) {
            try {
                return zzbi.zzf(zzbh.zzh(this.zzf, zzapVar));
            } catch (zzadn | GeneralSecurityException e) {
                Log.w(zzfn.zzb, "cannot decrypt keyset: ", e);
            }
        }
        return zzbi.zzf(zzar.zzb(this.zzf));
    }

    @Deprecated
    public final zzfl zzd(zznx zznxVar) {
        int i;
        String strZzf = zznxVar.zzf();
        byte[] bArrZzt = zznxVar.zze().zzt();
        zzoy zzoyVarZzd = zznxVar.zzd();
        int i2 = zzfn.zza;
        zzoy zzoyVar = zzoy.UNKNOWN_PREFIX;
        switch (zzoyVarZzd.ordinal()) {
            case 1:
                i = 1;
                break;
            case 2:
                i = 2;
                break;
            case 3:
                i = 3;
                break;
            case 4:
                i = 4;
                break;
            default:
                throw new IllegalArgumentException("Unknown output prefix type");
        }
        this.zzd = zzbf.zze(strZzf, bArrZzt, i);
        return this;
    }

    public final zzfl zze(String str) {
        if (!str.startsWith("android-keystore://")) {
            throw new IllegalArgumentException("key URI must start with android-keystore://");
        }
        this.zzb = str;
        return this;
    }

    public final zzfl zzf(Context context, String str, String str2) throws IOException {
        if (context == null) {
            throw new IllegalArgumentException("need an Android context");
        }
        this.zzf = new zzfq(context, "GenericIdpKeyset", str2);
        this.zza = new zzfr(context, "GenericIdpKeyset", str2);
        return this;
    }

    public final synchronized zzfn zzg() throws GeneralSecurityException, IOException {
        zzbi zzbiVarZze;
        if (this.zzb != null) {
            this.zzc = zzh();
        }
        try {
            zzbiVarZze = zzi();
        } catch (FileNotFoundException e) {
            if (Log.isLoggable(zzfn.zzb, 4)) {
                Log.i(zzfn.zzb, String.format("keyset not found, will generate a new one. %s", e.getMessage()));
            }
            if (this.zzd == null) {
                throw new GeneralSecurityException("cannot read or generate keyset");
            }
            zzbiVarZze = zzbi.zze();
            zzbiVarZze.zzc(this.zzd);
            zzbiVarZze.zzd(zzbiVarZze.zzb().zzd().zzb(0).zza());
            if (this.zzc != null) {
                zzbiVarZze.zzb().zzf(this.zza, this.zzc);
            } else {
                zzar.zza(zzbiVarZze.zzb(), this.zza);
            }
        }
        this.zze = zzbiVarZze;
        return new zzfn(this, null);
    }
}
