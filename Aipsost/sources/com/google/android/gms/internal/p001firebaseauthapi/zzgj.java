package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.Iterator;
import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzgj {
    public static final zzjd zza = new zzgi(null);

    public static zzjj zza(zzbu zzbuVar) {
        zzbe zzbeVar;
        zzjf zzjfVar = new zzjf();
        zzjfVar.zzb(zzbuVar.zzb());
        Iterator it = zzbuVar.zzd().iterator();
        while (it.hasNext()) {
            for (zzbq zzbqVar : (List) it.next()) {
                switch (zzbqVar.zzg() - 2) {
                    case 1:
                        zzbeVar = zzbe.zza;
                        break;
                    case 2:
                        zzbeVar = zzbe.zzb;
                        break;
                    case 3:
                        zzbeVar = zzbe.zzc;
                        break;
                    default:
                        throw new IllegalStateException("Unknown key status");
                }
                zzjfVar.zza(zzbeVar, zzbqVar.zza(), zzbqVar.zzc());
            }
        }
        if (zzbuVar.zza() != null) {
            zzjfVar.zzc(zzbuVar.zza().zza());
        }
        try {
            return zzjfVar.zzd();
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException(e);
        }
    }
}
