package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzhh {
    private final Map zza;
    private final Map zzb;
    private final Map zzc;
    private final Map zzd;

    /* synthetic */ zzhh(zzhb zzhbVar, zzhg zzhgVar) {
        this.zza = new HashMap(zzhbVar.zza);
        this.zzb = new HashMap(zzhbVar.zzb);
        this.zzc = new HashMap(zzhbVar.zzc);
        this.zzd = new HashMap(zzhbVar.zzd);
    }

    public final zzaw zza(zzha zzhaVar, @Nullable zzca zzcaVar) throws GeneralSecurityException {
        zzhd zzhdVar = new zzhd(zzhaVar.getClass(), zzhaVar.zzd(), null);
        if (this.zzb.containsKey(zzhdVar)) {
            return ((zzfv) this.zzb.get(zzhdVar)).zza(zzhaVar, zzcaVar);
        }
        throw new GeneralSecurityException("No Key Parser for requested key type " + zzhdVar.toString() + " available");
    }
}
