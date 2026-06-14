package com.google.android.gms.internal.measurement;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzab {
    private zzaa zza;
    private zzaa zzb;
    private final List<zzaa> zzc;

    public zzab() {
        this.zza = new zzaa("", 0L, null);
        this.zzb = new zzaa("", 0L, null);
        this.zzc = new ArrayList();
    }

    public final /* bridge */ /* synthetic */ Object clone() throws CloneNotSupportedException {
        zzab zzabVar = new zzab(this.zza.clone());
        Iterator<zzaa> it = this.zzc.iterator();
        while (it.hasNext()) {
            zzabVar.zzc.add(it.next().clone());
        }
        return zzabVar;
    }

    public final zzaa zza() {
        return this.zza;
    }

    public final void zzb(zzaa zzaaVar) {
        this.zza = zzaaVar;
        this.zzb = zzaaVar.clone();
        this.zzc.clear();
    }

    public final zzaa zzc() {
        return this.zzb;
    }

    public final void zzd(zzaa zzaaVar) {
        this.zzb = zzaaVar;
    }

    public final void zze(String str, long j, Map<String, Object> map) {
        this.zzc.add(new zzaa(str, j, map));
    }

    public final List<zzaa> zzf() {
        return this.zzc;
    }

    public zzab(zzaa zzaaVar) {
        this.zza = zzaaVar;
        this.zzb = zzaaVar.clone();
        this.zzc = new ArrayList();
    }
}
