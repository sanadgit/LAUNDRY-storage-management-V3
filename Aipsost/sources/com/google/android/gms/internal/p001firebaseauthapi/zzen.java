package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
@Deprecated
public final class zzen {
    public static final zznx zza;
    public static final zznx zzb;
    public static final zznx zzc;
    private static final byte[] zzd;

    static {
        byte[] bArr = new byte[0];
        zzd = bArr;
        zza = zza(4, 5, 3, zzcd.zza, zzoy.TINK, bArr);
        zzb = zza(4, 5, 4, zzcd.zza, zzoy.RAW, bArr);
        zzc = zza(4, 5, 3, zzcd.zze, zzoy.TINK, bArr);
    }

    public static zznx zza(int i, int i2, int i3, zznx zznxVar, zzoy zzoyVar, byte[] bArr) {
        zzlw zzlwVarZza = zzlx.zza();
        zzmi zzmiVarZza = zzmj.zza();
        zzmiVarZza.zzb(4);
        zzmiVarZza.zzc(5);
        zzmiVarZza.zza(zzacc.zzn(bArr));
        zzmj zzmjVar = (zzmj) zzmiVarZza.zzi();
        zzlt zzltVarZza = zzlu.zza();
        zzltVarZza.zza(zznxVar);
        zzlu zzluVar = (zzlu) zzltVarZza.zzi();
        zzlz zzlzVarZzb = zzma.zzb();
        zzlzVarZzb.zzb(zzmjVar);
        zzlzVarZzb.zza(zzluVar);
        zzlzVarZzb.zzc(i3);
        zzlwVarZza.zza((zzma) zzlzVarZzb.zzi());
        zzlx zzlxVar = (zzlx) zzlwVarZza.zzi();
        zznw zznwVarZza = zznx.zza();
        new zzef();
        zznwVarZza.zzb("type.googleapis.com/google.crypto.tink.EciesAeadHkdfPrivateKey");
        zznwVarZza.zza(zzoyVar);
        zznwVarZza.zzc(zzlxVar.zzo());
        return (zznx) zznwVarZza.zzi();
    }
}
