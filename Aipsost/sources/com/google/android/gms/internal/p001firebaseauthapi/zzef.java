package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzef extends zzgx {
    private static final byte[] zza = new byte[0];

    zzef() {
        super(zzmd.class, zzmg.class, new zzed(zzau.class));
    }

    static /* bridge */ /* synthetic */ zzga zzi(int i, int i2, int i3, zzbf zzbfVar, byte[] bArr, int i4) {
        zzoy zzoyVar;
        zzlw zzlwVarZza = zzlx.zza();
        zzmi zzmiVarZza = zzmj.zza();
        zzmiVarZza.zzb(4);
        zzmiVarZza.zzc(5);
        zzmiVarZza.zza(zzacc.zzn(bArr));
        zzmj zzmjVar = (zzmj) zzmiVarZza.zzi();
        zznw zznwVarZza = zznx.zza();
        zznwVarZza.zzb(zzbfVar.zzb());
        zznwVarZza.zzc(zzacc.zzn(zzbfVar.zzc()));
        switch (zzbfVar.zzd() - 1) {
            case 0:
                zzoyVar = zzoy.TINK;
                break;
            case 1:
                zzoyVar = zzoy.LEGACY;
                break;
            case 2:
                zzoyVar = zzoy.RAW;
                break;
            default:
                zzoyVar = zzoy.CRUNCHY;
                break;
        }
        zznwVarZza.zza(zzoyVar);
        zznx zznxVar = (zznx) zznwVarZza.zzi();
        zzlt zzltVarZza = zzlu.zza();
        zzltVarZza.zza(zznxVar);
        zzlu zzluVar = (zzlu) zzltVarZza.zzi();
        zzlz zzlzVarZzb = zzma.zzb();
        zzlzVarZzb.zzb(zzmjVar);
        zzlzVarZzb.zza(zzluVar);
        zzlzVarZzb.zzc(i3);
        zzlwVarZza.zza((zzma) zzlzVarZzb.zzi());
        return new zzga((zzlx) zzlwVarZza.zzi(), i4);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zzgb zza() {
        return new zzee(this, zzlx.class);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zznr zzb() {
        return zznr.ASYMMETRIC_PRIVATE;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* synthetic */ zzaek zzc(zzacc zzaccVar) throws zzadn {
        return zzmd.zzd(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final String zzd() {
        return "type.googleapis.com/google.crypto.tink.EciesAeadHkdfPrivateKey";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* bridge */ /* synthetic */ void zze(zzaek zzaekVar) throws GeneralSecurityException {
        zzmd zzmdVar = (zzmd) zzaekVar;
        if (zzmdVar.zzf().zzs()) {
            throw new GeneralSecurityException("invalid ECIES private key");
        }
        zzqs.zzc(zzmdVar.zza(), 0);
        zzeo.zza(zzmdVar.zze().zzb());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgx
    public final /* synthetic */ zzaek zzg(zzaek zzaekVar) throws GeneralSecurityException {
        return ((zzmd) zzaekVar).zze();
    }
}
