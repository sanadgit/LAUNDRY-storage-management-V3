package com.google.android.gms.internal.measurement;

import java.util.ArrayList;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaz extends zzaw {
    protected zzaz() {
        this.zza.add(zzbl.APPLY);
        this.zza.add(zzbl.BLOCK);
        this.zza.add(zzbl.BREAK);
        this.zza.add(zzbl.CASE);
        this.zza.add(zzbl.DEFAULT);
        this.zza.add(zzbl.CONTINUE);
        this.zza.add(zzbl.DEFINE_FUNCTION);
        this.zza.add(zzbl.FN);
        this.zza.add(zzbl.IF);
        this.zza.add(zzbl.QUOTE);
        this.zza.add(zzbl.RETURN);
        this.zza.add(zzbl.SWITCH);
        this.zza.add(zzbl.TERNARY);
    }

    private static zzap zzc(zzg zzgVar, List<zzap> list) {
        zzh.zzb(zzbl.FN.name(), 2, list);
        zzap zzapVarZza = zzgVar.zza(list.get(0));
        zzap zzapVarZza2 = zzgVar.zza(list.get(1));
        if (!(zzapVarZza2 instanceof zzae)) {
            throw new IllegalArgumentException(String.format("FN requires an ArrayValue of parameter names found %s", zzapVarZza2.getClass().getCanonicalName()));
        }
        List<zzap> listZzb = ((zzae) zzapVarZza2).zzb();
        List<zzap> arrayList = new ArrayList<>();
        if (list.size() > 2) {
            arrayList = list.subList(2, list.size());
        }
        return new zzao(zzapVarZza.zzc(), listZzb, arrayList, zzgVar);
    }

    /* JADX WARN: Code restructure failed: missing block: B:38:0x00ea, code lost:
    
        if (r8.equals("continue") == false) goto L41;
     */
    @Override // com.google.android.gms.internal.measurement.zzaw
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final com.google.android.gms.internal.measurement.zzap zza(java.lang.String r8, com.google.android.gms.internal.measurement.zzg r9, java.util.List<com.google.android.gms.internal.measurement.zzap> r10) {
        /*
            Method dump skipped, instruction units count: 646
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.internal.measurement.zzaz.zza(java.lang.String, com.google.android.gms.internal.measurement.zzg, java.util.List):com.google.android.gms.internal.measurement.zzap");
    }
}
