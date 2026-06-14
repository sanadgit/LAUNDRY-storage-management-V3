package com.google.firebase.auth.internal;

import android.app.Activity;
import com.google.android.gms.safetynet.SafetyNetApi;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.FirebaseAuth;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzb implements OnSuccessListener {
    final /* synthetic */ TaskCompletionSource zza;
    final /* synthetic */ FirebaseAuth zzb;
    final /* synthetic */ zzbm zzc;
    final /* synthetic */ Activity zzd;
    final /* synthetic */ zzf zze;

    zzb(zzf zzfVar, TaskCompletionSource taskCompletionSource, FirebaseAuth firebaseAuth, zzbm zzbmVar, Activity activity) {
        this.zze = zzfVar;
        this.zza = taskCompletionSource;
        this.zzb = firebaseAuth;
        this.zzc = zzbmVar;
        this.zzd = activity;
    }

    @Override // com.google.android.gms.tasks.OnSuccessListener
    public final /* bridge */ /* synthetic */ void onSuccess(Object obj) {
        SafetyNetApi.AttestationResponse attestationResponse = (SafetyNetApi.AttestationResponse) obj;
        if (zzbf.zza(attestationResponse)) {
            this.zza.setResult(new zze(attestationResponse.getJwsResult(), null));
        } else {
            this.zze.zze(this.zzb, this.zzc, this.zzd, this.zza);
        }
    }
}
