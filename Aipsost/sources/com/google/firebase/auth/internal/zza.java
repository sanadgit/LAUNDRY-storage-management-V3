package com.google.firebase.auth.internal;

import android.app.Activity;
import android.util.Log;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.FirebaseAuth;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zza implements OnFailureListener {
    final /* synthetic */ FirebaseAuth zza;
    final /* synthetic */ zzbm zzb;
    final /* synthetic */ Activity zzc;
    final /* synthetic */ TaskCompletionSource zzd;
    final /* synthetic */ zzf zze;

    zza(zzf zzfVar, FirebaseAuth firebaseAuth, zzbm zzbmVar, Activity activity, TaskCompletionSource taskCompletionSource) {
        this.zze = zzfVar;
        this.zza = firebaseAuth;
        this.zzb = zzbmVar;
        this.zzc = activity;
        this.zzd = taskCompletionSource;
    }

    @Override // com.google.android.gms.tasks.OnFailureListener
    public final void onFailure(Exception exc) {
        Log.e(zzf.zza, "Problem retrieving SafetyNet Token: ".concat(String.valueOf(exc.getMessage())));
        this.zze.zze(this.zza, this.zzb, this.zzc, this.zzd);
    }
}
