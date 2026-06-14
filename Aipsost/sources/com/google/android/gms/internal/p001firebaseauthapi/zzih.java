package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzih extends zzgc {
    public zzih() {
        super(zzmt.class, new zzif(zzbm.class));
    }

    public static final void zzh(zzmt zzmtVar) throws GeneralSecurityException {
        zzqs.zzc(zzmtVar.zza(), 0);
        if (zzmtVar.zzg().zzd() < 16) {
            throw new GeneralSecurityException("key too short");
        }
        zzn(zzmtVar.zzf());
    }

    static /* bridge */ /* synthetic */ zzga zzi(int i, int i2, int i3, int i4) {
        zzmv zzmvVarZzb = zzmw.zzb();
        zzmy zzmyVarZzb = zzmz.zzb();
        zzmyVarZzb.zzb(i3);
        zzmyVarZzb.zza(i2);
        zzmvVarZzb.zzb((zzmz) zzmyVarZzb.zzi());
        zzmvVarZzb.zza(i);
        return new zzga((zzmw) zzmvVarZzb.zzi(), i4);
    }

    /* JADX INFO: Access modifiers changed from: private */
    public static void zzn(zzmz zzmzVar) throws GeneralSecurityException {
        if (zzmzVar.zza() < 10) {
            throw new GeneralSecurityException("tag size too small");
        }
        switch (zzmzVar.zzf() - 2) {
            case 1:
                if (zzmzVar.zza() > 20) {
                    throw new GeneralSecurityException("tag size too big");
                }
                return;
            case 2:
                if (zzmzVar.zza() > 48) {
                    throw new GeneralSecurityException("tag size too big");
                }
                return;
            case 3:
                if (zzmzVar.zza() > 32) {
                    throw new GeneralSecurityException("tag size too big");
                }
                return;
            case 4:
                if (zzmzVar.zza() > 64) {
                    throw new GeneralSecurityException("tag size too big");
                }
                return;
            case 5:
                if (zzmzVar.zza() > 28) {
                    throw new GeneralSecurityException("tag size too big");
                }
                return;
            default:
                throw new GeneralSecurityException("unknown hash type");
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zzgb zza() {
        return new zzig(this, zzmw.class);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final zznr zzb() {
        return zznr.SYMMETRIC;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* synthetic */ zzaek zzc(zzacc zzaccVar) throws zzadn {
        return zzmt.zze(zzaccVar, zzacs.zza());
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final String zzd() {
        return "type.googleapis.com/google.crypto.tink.HmacKey";
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final /* bridge */ /* synthetic */ void zze(zzaek zzaekVar) throws GeneralSecurityException {
        zzh((zzmt) zzaekVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzgc
    public final int zzf() {
        return 2;
    }
}
