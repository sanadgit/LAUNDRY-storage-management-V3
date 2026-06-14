package com.google.firebase.auth;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.internal.IdTokenListener;
import com.google.firebase.internal.InternalTokenResult;
import java.util.Iterator;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzl implements Runnable {
    final /* synthetic */ FirebaseAuth zza;
    final /* synthetic */ InternalTokenResult zzb;

    zzl(FirebaseAuth firebaseAuth, InternalTokenResult internalTokenResult) {
        this.zza = firebaseAuth;
        this.zzb = internalTokenResult;
    }

    @Override // java.lang.Runnable
    public final void run() {
        Iterator it = this.zza.zzc.iterator();
        while (it.hasNext()) {
            ((IdTokenListener) it.next()).onIdTokenChanged(this.zzb);
        }
        Iterator it2 = this.zza.zzb.iterator();
        while (it2.hasNext()) {
            ((FirebaseAuth.IdTokenListener) it2.next()).onIdTokenChanged(this.zza);
        }
    }
}
