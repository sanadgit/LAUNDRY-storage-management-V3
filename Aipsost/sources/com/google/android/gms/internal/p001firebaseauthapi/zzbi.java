package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Iterator;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbi {
    private final zzoc zza;

    private zzbi(zzoc zzocVar) {
        this.zza = zzocVar;
    }

    public static zzbi zze() {
        return new zzbi(zzof.zzc());
    }

    public static zzbi zzf(zzbh zzbhVar) {
        return new zzbi((zzoc) zzbhVar.zzc().zzu());
    }

    private final synchronized int zzg() {
        int iZza;
        iZza = zzhj.zza();
        while (zzj(iZza)) {
            iZza = zzhj.zza();
        }
        return iZza;
    }

    private final synchronized zzoe zzh(zzns zznsVar, zzoy zzoyVar) throws GeneralSecurityException {
        zzod zzodVarZzc;
        int iZzg = zzg();
        if (zzoyVar == zzoy.UNKNOWN_PREFIX) {
            throw new GeneralSecurityException("unknown output prefix type");
        }
        zzodVarZzc = zzoe.zzc();
        zzodVarZzc.zza(zznsVar);
        zzodVarZzc.zzb(iZzg);
        zzodVarZzc.zzd(3);
        zzodVarZzc.zzc(zzoyVar);
        return (zzoe) zzodVarZzc.zzi();
    }

    private final synchronized zzoe zzi(zznx zznxVar) throws GeneralSecurityException {
        return zzh(zzbz.zzc(zznxVar), zznxVar.zzd());
    }

    private final synchronized boolean zzj(int i) {
        Iterator it = this.zza.zze().iterator();
        while (it.hasNext()) {
            if (((zzoe) it.next()).zza() == i) {
                return true;
            }
        }
        return false;
    }

    @Deprecated
    public final synchronized int zza(zznx zznxVar, boolean z) throws GeneralSecurityException {
        zzoe zzoeVarZzi;
        zzoeVarZzi = zzi(zznxVar);
        this.zza.zzb(zzoeVarZzi);
        return zzoeVarZzi.zza();
    }

    public final synchronized zzbh zzb() throws GeneralSecurityException {
        return zzbh.zza((zzof) this.zza.zzi());
    }

    public final synchronized zzbi zzc(zzbf zzbfVar) throws GeneralSecurityException {
        zza(zzbfVar.zza(), false);
        return this;
    }

    public final synchronized zzbi zzd(int i) throws GeneralSecurityException {
        for (int i2 = 0; i2 < this.zza.zza(); i2++) {
            zzoe zzoeVarZzd = this.zza.zzd(i2);
            if (zzoeVarZzd.zza() == i) {
                if (zzoeVarZzd.zzk() != 3) {
                    throw new GeneralSecurityException("cannot set key as primary because it's not enabled: " + i);
                }
                this.zza.zzc(i);
            }
        }
        throw new GeneralSecurityException("key not found: " + i);
        return this;
    }
}
