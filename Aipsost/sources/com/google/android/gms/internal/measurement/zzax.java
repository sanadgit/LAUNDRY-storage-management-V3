package com.google.android.gms.internal.measurement;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzax {
    final Map<String, zzaw> zza = new HashMap();
    final zzbj zzb = new zzbj();

    public zzax() {
        zza(new zzav());
        zza(new zzay());
        zza(new zzaz());
        zza(new zzbc());
        zza(new zzbh());
        zza(new zzbi());
        zza(new zzbk());
    }

    final void zza(zzaw zzawVar) {
        Iterator<zzbl> it = zzawVar.zza.iterator();
        while (it.hasNext()) {
            this.zza.put(it.next().zzb().toString(), zzawVar);
        }
    }

    public final zzap zzb(zzg zzgVar, zzap zzapVar) {
        zzh.zzk(zzgVar);
        if (!(zzapVar instanceof zzaq)) {
            return zzapVar;
        }
        zzaq zzaqVar = (zzaq) zzapVar;
        ArrayList<zzap> arrayListZzg = zzaqVar.zzg();
        String strZzb = zzaqVar.zzb();
        return (this.zza.containsKey(strZzb) ? this.zza.get(strZzb) : this.zzb).zza(strZzb, zzgVar, arrayListZzg);
    }
}
