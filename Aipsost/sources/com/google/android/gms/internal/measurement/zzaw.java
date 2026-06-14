package com.google.android.gms.internal.measurement;

import java.util.ArrayList;
import java.util.List;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public abstract class zzaw {
    final List<zzbl> zza = new ArrayList();

    protected zzaw() {
    }

    public abstract zzap zza(String str, zzg zzgVar, List<zzap> list);

    final zzap zzb(String str) {
        if (!this.zza.contains(zzh.zze(str))) {
            throw new IllegalArgumentException("Command not supported");
        }
        String strValueOf = String.valueOf(str);
        throw new UnsupportedOperationException(strValueOf.length() != 0 ? "Command not implemented: ".concat(strValueOf) : new String("Command not implemented: "));
    }
}
