package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzhb {
    private final Map zza;
    private final Map zzb;
    private final Map zzc;
    private final Map zzd;

    public zzhb() {
        this.zza = new HashMap();
        this.zzb = new HashMap();
        this.zzc = new HashMap();
        this.zzd = new HashMap();
    }

    public final zzhb zza(zzfv zzfvVar) throws GeneralSecurityException {
        zzhd zzhdVar = new zzhd(zzfvVar.zzd(), zzfvVar.zzc(), null);
        if (this.zzb.containsKey(zzhdVar)) {
            zzfv zzfvVar2 = (zzfv) this.zzb.get(zzhdVar);
            if (!zzfvVar2.equals(zzfvVar) || !zzfvVar.equals(zzfvVar2)) {
                throw new GeneralSecurityException("Attempt to register non-equal parser for already existing object of type: ".concat(zzhdVar.toString()));
            }
        } else {
            this.zzb.put(zzhdVar, zzfvVar);
        }
        return this;
    }

    public final zzhb zzb(zzfz zzfzVar) throws GeneralSecurityException {
        zzhf zzhfVar = new zzhf(zzfzVar.zzb(), zzfzVar.zzc(), null);
        if (this.zza.containsKey(zzhfVar)) {
            zzfz zzfzVar2 = (zzfz) this.zza.get(zzhfVar);
            if (!zzfzVar2.equals(zzfzVar) || !zzfzVar.equals(zzfzVar2)) {
                throw new GeneralSecurityException("Attempt to register non-equal serializer for already existing object of type: ".concat(zzhfVar.toString()));
            }
        } else {
            this.zza.put(zzhfVar, zzfzVar);
        }
        return this;
    }

    public final zzhb zzc(zzgr zzgrVar) throws GeneralSecurityException {
        zzhd zzhdVar = new zzhd(zzgrVar.zzc(), zzgrVar.zzb(), null);
        if (this.zzd.containsKey(zzhdVar)) {
            zzgr zzgrVar2 = (zzgr) this.zzd.get(zzhdVar);
            if (!zzgrVar2.equals(zzgrVar) || !zzgrVar.equals(zzgrVar2)) {
                throw new GeneralSecurityException("Attempt to register non-equal parser for already existing object of type: ".concat(zzhdVar.toString()));
            }
        } else {
            this.zzd.put(zzhdVar, zzgrVar);
        }
        return this;
    }

    public final zzhb zzd(zzgv zzgvVar) throws GeneralSecurityException {
        zzhf zzhfVar = new zzhf(zzgvVar.zzb(), zzgvVar.zzc(), null);
        if (this.zzc.containsKey(zzhfVar)) {
            zzgv zzgvVar2 = (zzgv) this.zzc.get(zzhfVar);
            if (!zzgvVar2.equals(zzgvVar) || !zzgvVar.equals(zzgvVar2)) {
                throw new GeneralSecurityException("Attempt to register non-equal serializer for already existing object of type: ".concat(zzhfVar.toString()));
            }
        } else {
            this.zzc.put(zzhfVar, zzgvVar);
        }
        return this;
    }

    public zzhb(zzhh zzhhVar) {
        this.zza = new HashMap(zzhhVar.zza);
        this.zzb = new HashMap(zzhhVar.zzb);
        this.zzc = new HashMap(zzhhVar.zzc);
        this.zzd = new HashMap(zzhhVar.zzd);
    }
}
