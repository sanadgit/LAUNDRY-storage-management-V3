package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzbx extends zzaz implements zzbw {
    private final zzgx zza;
    private final zzgc zzb;

    public zzbx(zzgx zzgxVar, zzgc zzgcVar, Class cls) {
        super(zzgxVar, cls);
        this.zza = zzgxVar;
        this.zzb = zzgcVar;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzbw
    public final zzns zzf(zzacc zzaccVar) throws GeneralSecurityException {
        try {
            zzaek zzaekVarZzc = this.zza.zzc(zzaccVar);
            this.zza.zze(zzaekVarZzc);
            zzaek zzaekVarZzg = this.zza.zzg(zzaekVarZzc);
            this.zzb.zze(zzaekVarZzg);
            zznp zznpVarZza = zzns.zza();
            zznpVarZza.zzb(this.zzb.zzd());
            zznpVarZza.zzc(zzaekVarZzg.zzo());
            zznpVarZza.zza(this.zzb.zzb());
            return (zzns) zznpVarZza.zzi();
        } catch (zzadn e) {
            throw new GeneralSecurityException("expected serialized proto of type ", e);
        }
    }
}
