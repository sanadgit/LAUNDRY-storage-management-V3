package com.google.android.gms.internal.p001firebaseauthapi;

import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Collections;
import javax.annotation.Nullable;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzjf {

    @Nullable
    private ArrayList zza = new ArrayList();
    private zzjc zzb = zzjc.zza;

    @Nullable
    private Integer zzc = null;

    public final zzjf zza(zzbe zzbeVar, int i, zzbn zzbnVar) {
        ArrayList arrayList = this.zza;
        if (arrayList == null) {
            throw new IllegalStateException("addEntry cannot be called after build()");
        }
        arrayList.add(new zzjh(zzbeVar, i, zzbnVar, null));
        return this;
    }

    public final zzjf zzb(zzjc zzjcVar) {
        if (this.zza == null) {
            throw new IllegalStateException("setAnnotations cannot be called after build()");
        }
        this.zzb = zzjcVar;
        return this;
    }

    public final zzjf zzc(int i) {
        if (this.zza == null) {
            throw new IllegalStateException("setPrimaryKeyId cannot be called after build()");
        }
        this.zzc = Integer.valueOf(i);
        return this;
    }

    public final zzjj zzd() throws GeneralSecurityException {
        if (this.zza == null) {
            throw new IllegalStateException("cannot call build() twice");
        }
        Integer num = this.zzc;
        if (num != null) {
            int iIntValue = num.intValue();
            ArrayList arrayList = this.zza;
            int size = arrayList.size();
            int i = 0;
            while (i < size) {
                int i2 = i + 1;
                if (((zzjh) arrayList.get(i)).zza() != iIntValue) {
                    i = i2;
                }
            }
            throw new GeneralSecurityException("primary key ID is not present in entries");
        }
        zzjj zzjjVar = new zzjj(this.zzb, Collections.unmodifiableList(this.zza), this.zzc, null);
        this.zza = null;
        return zzjjVar;
    }
}
