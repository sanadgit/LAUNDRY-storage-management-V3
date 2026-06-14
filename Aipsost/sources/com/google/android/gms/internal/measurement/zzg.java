package com.google.android.gms.internal.measurement;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzg {
    public final zzg zza;
    final zzax zzb;
    final Map<String, zzap> zzc = new HashMap();
    final Map<String, Boolean> zzd = new HashMap();

    public zzg(zzg zzgVar, zzax zzaxVar) {
        this.zza = zzgVar;
        this.zzb = zzaxVar;
    }

    public final zzap zza(zzap zzapVar) {
        return this.zzb.zzb(this, zzapVar);
    }

    public final zzap zzb(zzae zzaeVar) {
        zzap zzapVarZzb = zzap.zzf;
        Iterator<Integer> itZzg = zzaeVar.zzg();
        while (itZzg.hasNext()) {
            zzapVarZzb = this.zzb.zzb(this, zzaeVar.zzl(itZzg.next().intValue()));
            if (zzapVarZzb instanceof zzag) {
                break;
            }
        }
        return zzapVarZzb;
    }

    public final zzg zzc() {
        return new zzg(this, this.zzb);
    }

    public final boolean zzd(String str) {
        if (this.zzc.containsKey(str)) {
            return true;
        }
        zzg zzgVar = this.zza;
        if (zzgVar != null) {
            return zzgVar.zzd(str);
        }
        return false;
    }

    public final void zze(String str, zzap zzapVar) {
        zzg zzgVar;
        if (!this.zzc.containsKey(str) && (zzgVar = this.zza) != null && zzgVar.zzd(str)) {
            this.zza.zze(str, zzapVar);
        } else {
            if (this.zzd.containsKey(str)) {
                return;
            }
            if (zzapVar == null) {
                this.zzc.remove(str);
            } else {
                this.zzc.put(str, zzapVar);
            }
        }
    }

    public final void zzf(String str, zzap zzapVar) {
        if (this.zzd.containsKey(str)) {
            return;
        }
        if (zzapVar == null) {
            this.zzc.remove(str);
        } else {
            this.zzc.put(str, zzapVar);
        }
    }

    public final void zzg(String str, zzap zzapVar) {
        zzf(str, zzapVar);
        this.zzd.put(str, true);
    }

    public final zzap zzh(String str) {
        if (this.zzc.containsKey(str)) {
            return this.zzc.get(str);
        }
        zzg zzgVar = this.zza;
        if (zzgVar != null) {
            return zzgVar.zzh(str);
        }
        throw new IllegalArgumentException(String.format("%s is not defined", str));
    }
}
