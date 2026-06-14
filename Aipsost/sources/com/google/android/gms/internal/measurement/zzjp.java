package com.google.android.gms.internal.measurement;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-base@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjp {
    private static volatile zzjp zzc;
    private static volatile zzjp zzd;
    private final Map<zzjo, zzkb<?, ?>> zze;
    private static volatile boolean zzb = false;
    static final zzjp zza = new zzjp(true);

    zzjp() {
        this.zze = new HashMap();
    }

    public static zzjp zza() {
        zzjp zzjpVar = zzc;
        if (zzjpVar == null) {
            synchronized (zzjp.class) {
                zzjpVar = zzc;
                if (zzjpVar == null) {
                    zzjpVar = zza;
                    zzc = zzjpVar;
                }
            }
        }
        return zzjpVar;
    }

    public final <ContainingType extends zzli> zzkb<ContainingType, ?> zzc(ContainingType containingtype, int i) {
        return (zzkb) this.zze.get(new zzjo(containingtype, i));
    }

    zzjp(boolean z) {
        this.zze = Collections.emptyMap();
    }

    public static zzjp zzb() {
        zzjp zzjpVar = zzd;
        if (zzjpVar != null) {
            return zzjpVar;
        }
        synchronized (zzjp.class) {
            zzjp zzjpVar2 = zzd;
            if (zzjpVar2 != null) {
                return zzjpVar2;
            }
            zzjp zzjpVarZzb = zzjx.zzb(zzjp.class);
            zzd = zzjpVarZzb;
            return zzjpVarZzb;
        }
    }
}
