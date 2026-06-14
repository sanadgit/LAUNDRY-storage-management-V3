package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Set;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzbb implements zzbc {
    final /* synthetic */ zzgx zza;
    final /* synthetic */ zzgc zzb;

    zzbb(zzgx zzgxVar, zzgc zzgcVar) {
        this.zza = zzgxVar;
        this.zzb = zzgcVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbc
    public final zzax zza(Class cls) throws GeneralSecurityException {
        try {
            return new zzbx(this.zza, this.zzb, cls);
        } catch (IllegalArgumentException e) {
            throw new GeneralSecurityException("Primitive type not supported", e);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbc
    public final zzax zzb() {
        zzgx zzgxVar = this.zza;
        return new zzbx(zzgxVar, this.zzb, zzgxVar.zzj());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbc
    public final Class zzc() {
        return this.zza.getClass();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbc
    public final Class zzd() {
        return this.zzb.getClass();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbc
    public final Set zze() {
        return this.zza.zzm();
    }
}
