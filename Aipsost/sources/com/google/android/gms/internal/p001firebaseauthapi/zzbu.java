package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentMap;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbu {
    private final ConcurrentMap zza;
    private final zzbq zzb;
    private final Class zzc;
    private final zzjc zzd;

    /* synthetic */ zzbu(ConcurrentMap concurrentMap, zzbq zzbqVar, zzjc zzjcVar, Class cls, zzbt zzbtVar) {
        this.zza = concurrentMap;
        this.zzb = zzbqVar;
        this.zzc = cls;
        this.zzd = zzjcVar;
    }

    @Nullable
    public final zzbq zza() {
        return this.zzb;
    }

    public final zzjc zzb() {
        return this.zzd;
    }

    public final Class zzc() {
        return this.zzc;
    }

    public final Collection zzd() {
        return this.zza.values();
    }

    public final List zze(byte[] bArr) {
        List list = (List) this.zza.get(new zzbs(bArr, null));
        return list != null ? list : Collections.emptyList();
    }

    public final boolean zzf() {
        return !this.zzd.zza().isEmpty();
    }
}
