package com.google.android.gms.internal.p001firebaseauthapi;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
@Deprecated
public final class zzcd {
    public static final zznx zza = zzb(16);
    public static final zznx zzb = zzb(32);
    public static final zznx zzc = zza(16, 16);
    public static final zznx zzd = zza(32, 16);
    public static final zznx zze = zzc(16, 16, 32, 16, 5);
    public static final zznx zzf = zzc(32, 16, 32, 32, 5);
    public static final zznx zzg;
    public static final zznx zzh;

    static {
        zznw zznwVarZza = zznx.zza();
        new zzcy();
        zznwVarZza.zzb("type.googleapis.com/google.crypto.tink.ChaCha20Poly1305Key");
        zznwVarZza.zza(zzoy.TINK);
        zzg = (zznx) zznwVarZza.zzi();
        zznw zznwVarZza2 = zznx.zza();
        new zzdi();
        zznwVarZza2.zzb("type.googleapis.com/google.crypto.tink.XChaCha20Poly1305Key");
        zznwVarZza2.zza(zzoy.TINK);
        zzh = (zznx) zznwVarZza2.zzi();
    }

    public static zznx zza(int i, int i2) {
        zzkn zzknVarZzb = zzko.zzb();
        zzknVarZzb.zza(i);
        zzkq zzkqVarZzb = zzkr.zzb();
        zzkqVarZzb.zza(16);
        zzknVarZzb.zzb((zzkr) zzkqVarZzb.zzi());
        zzko zzkoVar = (zzko) zzknVarZzb.zzi();
        zznw zznwVarZza = zznx.zza();
        zznwVarZza.zzc(zzkoVar.zzo());
        new zzcp();
        zznwVarZza.zzb("type.googleapis.com/google.crypto.tink.AesEaxKey");
        zznwVarZza.zza(zzoy.TINK);
        return (zznx) zznwVarZza.zzi();
    }

    public static zznx zzb(int i) {
        zzkw zzkwVarZzb = zzkx.zzb();
        zzkwVarZzb.zza(i);
        zzkx zzkxVar = (zzkx) zzkwVarZzb.zzi();
        zznw zznwVarZza = zznx.zza();
        zznwVarZza.zzc(zzkxVar.zzo());
        new zzcs();
        zznwVarZza.zzb("type.googleapis.com/google.crypto.tink.AesGcmKey");
        zznwVarZza.zza(zzoy.TINK);
        return (zznx) zznwVarZza.zzi();
    }

    public static zznx zzc(int i, int i2, int i3, int i4, int i5) {
        zzke zzkeVarZzb = zzkf.zzb();
        zzkh zzkhVarZzb = zzki.zzb();
        zzkhVarZzb.zza(16);
        zzkeVarZzb.zzb((zzki) zzkhVarZzb.zzi());
        zzkeVarZzb.zza(i);
        zzkf zzkfVar = (zzkf) zzkeVarZzb.zzi();
        zzmv zzmvVarZzb = zzmw.zzb();
        zzmy zzmyVarZzb = zzmz.zzb();
        zzmyVarZzb.zzb(5);
        zzmyVarZzb.zza(i4);
        zzmvVarZzb.zzb((zzmz) zzmyVarZzb.zzi());
        zzmvVarZzb.zza(32);
        zzmw zzmwVar = (zzmw) zzmvVarZzb.zzi();
        zzjy zzjyVarZza = zzjz.zza();
        zzjyVarZza.zza(zzkfVar);
        zzjyVarZza.zzb(zzmwVar);
        zzjz zzjzVar = (zzjz) zzjyVarZza.zzi();
        zznw zznwVarZza = zznx.zza();
        zznwVarZza.zzc(zzjzVar.zzo());
        new zzcj();
        zznwVarZza.zzb("type.googleapis.com/google.crypto.tink.AesCtrHmacAeadKey");
        zznwVarZza.zza(zzoy.TINK);
        return (zznx) zznwVarZza.zzi();
    }
}
