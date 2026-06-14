package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzaes {
    private static final zzaes zza = new zzaes();
    private final ConcurrentMap zzc = new ConcurrentHashMap();
    private final zzaex zzb = new zzaec();

    private zzaes() {
    }

    public static zzaes zza() {
        return zza;
    }

    public final zzaew zzb(Class cls) {
        zzadl.zzf(cls, "messageType");
        zzaew zzaewVarZza = (zzaew) this.zzc.get(cls);
        if (zzaewVarZza == null) {
            zzaewVarZza = this.zzb.zza(cls);
            zzadl.zzf(cls, "messageType");
            zzadl.zzf(zzaewVarZza, "schema");
            zzaew zzaewVar = (zzaew) this.zzc.putIfAbsent(cls, zzaewVarZza);
            if (zzaewVar != null) {
                return zzaewVar;
            }
        }
        return zzaewVarZza;
    }
}
