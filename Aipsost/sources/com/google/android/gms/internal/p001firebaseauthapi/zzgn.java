package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.concurrent.atomic.AtomicReference;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzgn {
    private static final zzgn zza = new zzgn();
    private final AtomicReference zzb = new AtomicReference(new zzhh(new zzhb(), null));

    public static zzgn zzb() {
        return zza;
    }

    public final zzaw zza(zzgy zzgyVar, zzca zzcaVar) {
        try {
            return ((zzhh) this.zzb.get()).zza(zzgyVar, zzcaVar);
        } catch (GeneralSecurityException e) {
            try {
                return new zzgg(zzgyVar, zzcaVar);
            } catch (GeneralSecurityException e2) {
                throw new zzhi("Creating a LegacyProtoKey failed", e2);
            }
        }
    }

    public final synchronized void zzc(zzfv zzfvVar) throws GeneralSecurityException {
        zzhb zzhbVar = new zzhb((zzhh) this.zzb.get());
        zzhbVar.zza(zzfvVar);
        this.zzb.set(new zzhh(zzhbVar, null));
    }

    public final synchronized void zzd(zzfz zzfzVar) throws GeneralSecurityException {
        zzhb zzhbVar = new zzhb((zzhh) this.zzb.get());
        zzhbVar.zzb(zzfzVar);
        this.zzb.set(new zzhh(zzhbVar, null));
    }

    public final synchronized void zze(zzgr zzgrVar) throws GeneralSecurityException {
        zzhb zzhbVar = new zzhb((zzhh) this.zzb.get());
        zzhbVar.zzc(zzgrVar);
        this.zzb.set(new zzhh(zzhbVar, null));
    }

    public final synchronized void zzf(zzgv zzgvVar) throws GeneralSecurityException {
        zzhb zzhbVar = new zzhb((zzhh) this.zzb.get());
        zzhbVar.zzd(zzgvVar);
        this.zzb.set(new zzhh(zzhbVar, null));
    }
}
