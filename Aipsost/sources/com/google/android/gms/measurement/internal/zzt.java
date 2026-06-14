package com.google.android.gms.measurement.internal;

import androidx.collection.ArrayMap;
import com.google.android.gms.internal.measurement.zzog;
import java.util.ArrayList;
import java.util.BitSet;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzt {
    final /* synthetic */ zzy zza;
    private String zzb;
    private boolean zzc;
    private com.google.android.gms.internal.measurement.zzgd zzd;
    private BitSet zze;
    private BitSet zzf;
    private Map<Integer, Long> zzg;
    private Map<Integer, List<Long>> zzh;

    /* synthetic */ zzt(zzy zzyVar, String str, zzs zzsVar) {
        this.zza = zzyVar;
        this.zzb = str;
        this.zzc = true;
        this.zze = new BitSet();
        this.zzf = new BitSet();
        this.zzg = new ArrayMap();
        this.zzh = new ArrayMap();
    }

    final void zza(zzw zzwVar) {
        int iZza = zzwVar.zza();
        Boolean bool = zzwVar.zzd;
        if (bool != null) {
            this.zzf.set(iZza, bool.booleanValue());
        }
        Boolean bool2 = zzwVar.zze;
        if (bool2 != null) {
            this.zze.set(iZza, bool2.booleanValue());
        }
        if (zzwVar.zzf != null) {
            Map<Integer, Long> map = this.zzg;
            Integer numValueOf = Integer.valueOf(iZza);
            Long l = map.get(numValueOf);
            long jLongValue = zzwVar.zzf.longValue() / 1000;
            if (l == null || jLongValue > l.longValue()) {
                this.zzg.put(numValueOf, Long.valueOf(jLongValue));
            }
        }
        if (zzwVar.zzg != null) {
            Map<Integer, List<Long>> map2 = this.zzh;
            Integer numValueOf2 = Integer.valueOf(iZza);
            List<Long> arrayList = map2.get(numValueOf2);
            if (arrayList == null) {
                arrayList = new ArrayList<>();
                this.zzh.put(numValueOf2, arrayList);
            }
            if (zzwVar.zzb()) {
                arrayList.clear();
            }
            zzog.zzb();
            if (this.zza.zzs.zzc().zzn(this.zzb, zzea.zzZ) && zzwVar.zzc()) {
                arrayList.clear();
            }
            zzog.zzb();
            if (!this.zza.zzs.zzc().zzn(this.zzb, zzea.zzZ)) {
                arrayList.add(Long.valueOf(zzwVar.zzg.longValue() / 1000));
                return;
            }
            Long lValueOf = Long.valueOf(zzwVar.zzg.longValue() / 1000);
            if (arrayList.contains(lValueOf)) {
                return;
            }
            arrayList.add(lValueOf);
        }
    }

    final com.google.android.gms.internal.measurement.zzfk zzb(int i) {
        ArrayList arrayList;
        List listEmptyList;
        com.google.android.gms.internal.measurement.zzfj zzfjVarZzh = com.google.android.gms.internal.measurement.zzfk.zzh();
        zzfjVarZzh.zza(i);
        zzfjVarZzh.zzd(this.zzc);
        com.google.android.gms.internal.measurement.zzgd zzgdVar = this.zzd;
        if (zzgdVar != null) {
            zzfjVarZzh.zzc(zzgdVar);
        }
        com.google.android.gms.internal.measurement.zzgc zzgcVarZzk = com.google.android.gms.internal.measurement.zzgd.zzk();
        zzgcVarZzk.zzc(zzkp.zzn(this.zze));
        zzgcVarZzk.zza(zzkp.zzn(this.zzf));
        Map<Integer, Long> map = this.zzg;
        if (map == null) {
            arrayList = null;
        } else {
            ArrayList arrayList2 = new ArrayList(map.size());
            Iterator<Integer> it = this.zzg.keySet().iterator();
            while (it.hasNext()) {
                int iIntValue = it.next().intValue();
                Long l = this.zzg.get(Integer.valueOf(iIntValue));
                if (l != null) {
                    com.google.android.gms.internal.measurement.zzfl zzflVarZze = com.google.android.gms.internal.measurement.zzfm.zze();
                    zzflVarZze.zza(iIntValue);
                    zzflVarZze.zzb(l.longValue());
                    arrayList2.add(zzflVarZze.zzaA());
                }
            }
            arrayList = arrayList2;
        }
        if (arrayList != null) {
            zzgcVarZzk.zze(arrayList);
        }
        Map<Integer, List<Long>> map2 = this.zzh;
        if (map2 == null) {
            listEmptyList = Collections.emptyList();
        } else {
            ArrayList arrayList3 = new ArrayList(map2.size());
            for (Integer num : this.zzh.keySet()) {
                com.google.android.gms.internal.measurement.zzge zzgeVarZzf = com.google.android.gms.internal.measurement.zzgf.zzf();
                zzgeVarZzf.zza(num.intValue());
                List<Long> list = this.zzh.get(num);
                if (list != null) {
                    Collections.sort(list);
                    zzgeVarZzf.zzb(list);
                }
                arrayList3.add((com.google.android.gms.internal.measurement.zzgf) zzgeVarZzf.zzaA());
            }
            listEmptyList = arrayList3;
        }
        zzgcVarZzk.zzg(listEmptyList);
        zzfjVarZzh.zzb(zzgcVarZzk);
        return (com.google.android.gms.internal.measurement.zzfk) zzfjVarZzh.zzaA();
    }

    /* synthetic */ zzt(zzy zzyVar, String str, com.google.android.gms.internal.measurement.zzgd zzgdVar, BitSet bitSet, BitSet bitSet2, Map map, Map map2, zzs zzsVar) {
        this.zza = zzyVar;
        this.zzb = str;
        this.zze = bitSet;
        this.zzf = bitSet2;
        this.zzg = map;
        this.zzh = new ArrayMap();
        for (Integer num : map2.keySet()) {
            ArrayList arrayList = new ArrayList();
            arrayList.add((Long) map2.get(num));
            this.zzh.put(num, arrayList);
        }
        this.zzc = false;
        this.zzd = zzgdVar;
    }
}
