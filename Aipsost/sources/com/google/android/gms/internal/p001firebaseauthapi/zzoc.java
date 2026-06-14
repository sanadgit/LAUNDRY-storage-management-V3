package com.google.android.gms.internal.p001firebaseauthapi;

import java.util.Collections;
import java.util.List;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzoc extends zzadb implements zzael {
    private zzoc() {
        super(zzof.zzb);
    }

    public final int zza() {
        return ((zzof) this.zza).zza();
    }

    public final zzoc zzb(zzoe zzoeVar) {
        zzm();
        zzof.zzi((zzof) this.zza, zzoeVar);
        return this;
    }

    public final zzoc zzc(int i) {
        zzm();
        ((zzof) this.zza).zzd = i;
        return this;
    }

    public final zzoe zzd(int i) {
        return ((zzof) this.zza).zzd(i);
    }

    public final List zze() {
        return Collections.unmodifiableList(((zzof) this.zza).zzg());
    }

    /* synthetic */ zzoc(zzob zzobVar) {
        super(zzof.zzb);
    }
}
