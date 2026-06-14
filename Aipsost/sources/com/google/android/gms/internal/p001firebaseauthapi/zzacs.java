package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzacs {
    public static final /* synthetic */ int zzb = 0;
    private final Map zzd;
    private static volatile boolean zzc = false;
    static final zzacs zza = new zzacs(true);

    zzacs() {
        this.zzd = new HashMap();
    }

    public static zzacs zza() {
        return zza;
    }

    public final zzadd zzb(zzaek zzaekVar, int i) {
        return (zzadd) this.zzd.get(new zzacr(zzaekVar, i));
    }

    zzacs(boolean z) {
        this.zzd = Collections.emptyMap();
    }
}
