package com.google.android.gms.internal.p001firebaseauthapi;

import com.google.android.gms.security.ProviderInstaller;
import java.security.GeneralSecurityException;
import java.security.Provider;
import java.security.Security;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzpz {
    public static final zzpz zza;
    public static final zzpz zzb;
    public static final zzpz zzc;
    public static final zzpz zzd;
    public static final zzpz zze;
    public static final zzpz zzf;
    public static final zzpz zzg;
    private static final Logger zzh = Logger.getLogger(zzpz.class.getName());
    private static final List zzi;
    private static final boolean zzj;
    private final zzqh zzk;

    static {
        if (zzdw.zzb()) {
            zzi = zzb(ProviderInstaller.PROVIDER_NAME, "AndroidOpenSSL", "Conscrypt");
            zzj = false;
        } else if (zzqr.zza()) {
            zzi = zzb(ProviderInstaller.PROVIDER_NAME, "AndroidOpenSSL");
            zzj = true;
        } else {
            zzi = new ArrayList();
            zzj = true;
        }
        zza = new zzpz(new zzqa());
        zzb = new zzpz(new zzqe());
        zzc = new zzpz(new zzqg());
        zzd = new zzpz(new zzqf());
        zze = new zzpz(new zzqb());
        zzf = new zzpz(new zzqd());
        zzg = new zzpz(new zzqc());
    }

    public zzpz(zzqh zzqhVar) {
        this.zzk = zzqhVar;
    }

    public static List zzb(String... strArr) {
        ArrayList arrayList = new ArrayList();
        for (String str : strArr) {
            Provider provider = Security.getProvider(str);
            if (provider != null) {
                arrayList.add(provider);
            } else {
                zzh.logp(Level.INFO, "com.google.crypto.tink.subtle.EngineFactory", "toProviderList", String.format("Provider %s not available", str));
            }
        }
        return arrayList;
    }

    public final Object zza(String str) throws GeneralSecurityException {
        Iterator it = zzi.iterator();
        Exception exc = null;
        while (it.hasNext()) {
            try {
                return this.zzk.zza(str, (Provider) it.next());
            } catch (Exception e) {
                if (exc == null) {
                    exc = e;
                }
            }
        }
        if (zzj) {
            return this.zzk.zza(str, null);
        }
        throw new GeneralSecurityException("No good Provider found.", exc);
    }
}
