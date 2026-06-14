package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzaf {
    private final zzn zza;
    private final zzae zzb;

    private zzaf(zzae zzaeVar) {
        zzm zzmVar = zzm.zza;
        this.zzb = zzaeVar;
        this.zza = zzmVar;
    }

    public static zzaf zzb(char c) {
        return new zzaf(new zzaa(new zzk('.')));
    }

    public static zzaf zzc(String str) {
        zzq zzqVarZza = zzx.zza("[.-]");
        if (!((zzs) zzqVarZza.zza("")).zza.matches()) {
            return new zzaf(new zzac(zzqVarZza));
        }
        throw new IllegalArgumentException(zzag.zzb("The pattern may not match the empty string: %s", zzqVarZza));
    }

    public final List zzd(CharSequence charSequence) {
        if (charSequence == null) {
            throw null;
        }
        Iterator itZza = this.zzb.zza(this, charSequence);
        ArrayList arrayList = new ArrayList();
        while (itZza.hasNext()) {
            arrayList.add((String) itZza.next());
        }
        return Collections.unmodifiableList(arrayList);
    }
}
