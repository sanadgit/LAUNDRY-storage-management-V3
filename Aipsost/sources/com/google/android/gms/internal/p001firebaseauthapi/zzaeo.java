package com.google.android.gms.internal.p001firebaseauthapi;

import java.io.IOException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaeo implements zzaew {
    private final zzaek zza;
    private final zzafn zzb;
    private final boolean zzc;
    private final zzact zzd;

    private zzaeo(zzafn zzafnVar, zzact zzactVar, zzaek zzaekVar) {
        this.zzb = zzafnVar;
        this.zzc = zzactVar.zzh(zzaekVar);
        this.zzd = zzactVar;
        this.zza = zzaekVar;
    }

    static zzaeo zzc(zzafn zzafnVar, zzact zzactVar, zzaek zzaekVar) {
        return new zzaeo(zzafnVar, zzactVar, zzaekVar);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final int zza(Object obj) {
        zzafn zzafnVar = this.zzb;
        int iZzb = zzafnVar.zzb(zzafnVar.zzd(obj));
        if (!this.zzc) {
            return iZzb;
        }
        this.zzd.zza(obj);
        throw null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final int zzb(Object obj) {
        int iHashCode = this.zzb.zzd(obj).hashCode();
        if (!this.zzc) {
            return iHashCode;
        }
        this.zzd.zza(obj);
        throw null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final Object zze() {
        zzaek zzaekVar = this.zza;
        return zzaekVar instanceof zzadf ? ((zzadf) zzaekVar).zzw() : zzaekVar.zzB().zzk();
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final void zzf(Object obj) {
        this.zzb.zzm(obj);
        this.zzd.zze(obj);
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final void zzg(Object obj, Object obj2) {
        zzaey.zzF(this.zzb, obj, obj2);
        if (this.zzc) {
            zzaey.zzE(this.zzd, obj, obj2);
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final void zzh(Object obj, zzaev zzaevVar, zzacs zzacsVar) throws IOException {
        boolean zZzO;
        zzafn zzafnVar = this.zzb;
        zzact zzactVar = this.zzd;
        Object objZzc = zzafnVar.zzc(obj);
        zzacx zzacxVarZzb = zzactVar.zzb(obj);
        while (zzaevVar.zzc() != Integer.MAX_VALUE) {
            try {
                int iZzd = zzaevVar.zzd();
                if (iZzd != 11) {
                    if ((iZzd & 7) == 2) {
                        Object objZzc2 = zzactVar.zzc(zzacsVar, this.zza, iZzd >>> 3);
                        if (objZzc2 != null) {
                            zzactVar.zzf(zzaevVar, objZzc2, zzacsVar, zzacxVarZzb);
                        } else {
                            zZzO = zzafnVar.zzp(objZzc, zzaevVar);
                        }
                    } else {
                        zZzO = zzaevVar.zzO();
                    }
                    if (!zZzO) {
                        break;
                    }
                } else {
                    Object objZzc3 = null;
                    zzacc zzaccVarZzp = null;
                    int iZzj = 0;
                    while (zzaevVar.zzc() != Integer.MAX_VALUE) {
                        int iZzd2 = zzaevVar.zzd();
                        if (iZzd2 == 16) {
                            iZzj = zzaevVar.zzj();
                            objZzc3 = zzactVar.zzc(zzacsVar, this.zza, iZzj);
                        } else if (iZzd2 == 26) {
                            if (objZzc3 != null) {
                                zzactVar.zzf(zzaevVar, objZzc3, zzacsVar, zzacxVarZzb);
                            } else {
                                zzaccVarZzp = zzaevVar.zzp();
                            }
                        } else if (!zzaevVar.zzO()) {
                            break;
                        }
                    }
                    if (zzaevVar.zzd() != 12) {
                        throw zzadn.zzb();
                    }
                    if (zzaccVarZzp != null) {
                        if (objZzc3 != null) {
                            zzactVar.zzg(zzaccVarZzp, objZzc3, zzacsVar, zzacxVarZzb);
                        } else {
                            zzafnVar.zzk(objZzc, iZzj, zzaccVarZzp);
                        }
                    }
                }
            } finally {
                zzafnVar.zzn(obj, objZzc);
            }
        }
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final void zzi(Object obj, byte[] bArr, int i, int i2, zzabp zzabpVar) throws IOException {
        zzadf zzadfVar = (zzadf) obj;
        if (zzadfVar.zzc == zzafo.zzc()) {
            zzadfVar.zzc = zzafo.zzf();
        }
        throw null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final boolean zzj(Object obj, Object obj2) {
        if (!this.zzb.zzd(obj).equals(this.zzb.zzd(obj2))) {
            return false;
        }
        if (!this.zzc) {
            return true;
        }
        this.zzd.zza(obj);
        this.zzd.zza(obj2);
        throw null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final boolean zzk(Object obj) {
        this.zzd.zza(obj);
        throw null;
    }

    @Override // com.google.android.gms.internal.p001firebaseauthapi.zzaew
    public final void zzn(Object obj, zzaco zzacoVar) throws IOException {
        this.zzd.zza(obj);
        throw null;
    }
}
