package com.google.android.gms.internal.measurement;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzao extends zzai implements zzal {
    protected final List<String> zza;
    protected final List<zzap> zzb;
    protected zzg zzc;

    private zzao(zzao zzaoVar) {
        super(zzaoVar.zzd);
        ArrayList arrayList = new ArrayList(zzaoVar.zza.size());
        this.zza = arrayList;
        arrayList.addAll(zzaoVar.zza);
        ArrayList arrayList2 = new ArrayList(zzaoVar.zzb.size());
        this.zzb = arrayList2;
        arrayList2.addAll(zzaoVar.zzb);
        this.zzc = zzaoVar.zzc;
    }

    @Override // com.google.android.gms.internal.measurement.zzai
    public final zzap zza(zzg zzgVar, List<zzap> list) {
        zzg zzgVarZzc = this.zzc.zzc();
        for (int i = 0; i < this.zza.size(); i++) {
            if (i < list.size()) {
                zzgVarZzc.zzf(this.zza.get(i), zzgVar.zza(list.get(i)));
            } else {
                zzgVarZzc.zzf(this.zza.get(i), zzf);
            }
        }
        for (zzap zzapVar : this.zzb) {
            zzap zzapVarZza = zzgVarZzc.zza(zzapVar);
            if (zzapVarZza instanceof zzaq) {
                zzapVarZza = zzgVarZzc.zza(zzapVar);
            }
            if (zzapVarZza instanceof zzag) {
                return ((zzag) zzapVarZza).zzb();
            }
        }
        return zzap.zzf;
    }

    @Override // com.google.android.gms.internal.measurement.zzai, com.google.android.gms.internal.measurement.zzap
    public final zzap zzt() {
        return new zzao(this);
    }

    public zzao(String str, List<zzap> list, List<zzap> list2, zzg zzgVar) {
        super(str);
        this.zza = new ArrayList();
        this.zzc = zzgVar;
        if (!list.isEmpty()) {
            Iterator<zzap> it = list.iterator();
            while (it.hasNext()) {
                this.zza.add(it.next().zzc());
            }
        }
        this.zzb = new ArrayList(list2);
    }
}
