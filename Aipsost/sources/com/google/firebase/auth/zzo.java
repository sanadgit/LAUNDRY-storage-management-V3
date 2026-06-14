package com.google.firebase.auth;

import android.app.Activity;
import android.util.Log;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.PhoneAuthProvider;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzo implements OnCompleteListener {
    final /* synthetic */ String zza;
    final /* synthetic */ long zzb;
    final /* synthetic */ TimeUnit zzc;
    final /* synthetic */ PhoneAuthProvider.OnVerificationStateChangedCallbacks zzd;
    final /* synthetic */ Activity zze;
    final /* synthetic */ Executor zzf;
    final /* synthetic */ boolean zzg;
    final /* synthetic */ FirebaseAuth zzh;

    zzo(FirebaseAuth firebaseAuth, String str, long j, TimeUnit timeUnit, PhoneAuthProvider.OnVerificationStateChangedCallbacks onVerificationStateChangedCallbacks, Activity activity, Executor executor, boolean z) {
        this.zzh = firebaseAuth;
        this.zza = str;
        this.zzb = j;
        this.zzc = timeUnit;
        this.zzd = onVerificationStateChangedCallbacks;
        this.zze = activity;
        this.zzf = executor;
        this.zzg = z;
    }

    @Override // com.google.android.gms.tasks.OnCompleteListener
    public final void onComplete(Task task) {
        String strZza;
        String str;
        if (task.isSuccessful()) {
            String strZzb = ((com.google.firebase.auth.internal.zze) task.getResult()).zzb();
            strZza = ((com.google.firebase.auth.internal.zze) task.getResult()).zza();
            str = strZzb;
        } else {
            Log.e("FirebaseAuth", "Error while validating application identity: ".concat(String.valueOf(task.getException() != null ? task.getException().getMessage() : "")));
            Log.e("FirebaseAuth", "Proceeding without any application identifier.");
            strZza = null;
            str = null;
        }
        this.zzh.zzJ(this.zza, this.zzb, this.zzc, this.zzd, this.zze, this.zzf, this.zzg, strZza, str);
    }
}
