package com.google.firebase.auth.internal;

import android.app.Activity;
import android.content.Intent;
import android.text.TextUtils;
import android.util.Log;
import com.bumptech.glide.load.Key;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.internal.p001firebaseauthapi.zzxc;
import com.google.android.gms.internal.p001firebaseauthapi.zzxo;
import com.google.android.gms.internal.p001firebaseauthapi.zzyz;
import com.google.android.gms.safetynet.SafetyNet;
import com.google.android.gms.safetynet.SafetyNetClient;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.android.gms.tasks.Tasks;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import java.io.UnsupportedEncodingException;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzf {
    private static final String zza = zzf.class.getSimpleName();
    private static final zzf zzb = new zzf();

    private zzf() {
    }

    public static zzf zzb() {
        return zzb;
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zze(FirebaseAuth firebaseAuth, zzbm zzbmVar, Activity activity, TaskCompletionSource taskCompletionSource) {
        Task task;
        zzbmVar.zzg(firebaseAuth.getApp().getApplicationContext(), firebaseAuth);
        Preconditions.checkNotNull(activity);
        TaskCompletionSource taskCompletionSource2 = new TaskCompletionSource();
        if (zzax.zza().zzg(activity, taskCompletionSource2)) {
            Intent intent = new Intent("com.google.firebase.auth.internal.ACTION_SHOW_RECAPTCHA");
            intent.setClass(activity, RecaptchaActivity.class);
            intent.setPackage(activity.getPackageName());
            intent.putExtra("com.google.firebase.auth.KEY_API_KEY", firebaseAuth.getApp().getOptions().getApiKey());
            if (!TextUtils.isEmpty(firebaseAuth.getTenantId())) {
                intent.putExtra("com.google.firebase.auth.KEY_TENANT_ID", firebaseAuth.getTenantId());
            }
            intent.putExtra("com.google.firebase.auth.internal.CLIENT_VERSION", zzxo.zza().zzb());
            intent.putExtra("com.google.firebase.auth.internal.FIREBASE_APP_NAME", firebaseAuth.getApp().getName());
            activity.startActivity(intent);
            task = taskCompletionSource2.getTask();
        } else {
            task = Tasks.forException(zzxc.zza(new Status(17057, "reCAPTCHA flow already in progress")));
        }
        task.addOnSuccessListener(new zzd(this, taskCompletionSource)).addOnFailureListener(new zzc(this, taskCompletionSource));
    }

    public final Task zza(FirebaseAuth firebaseAuth, String str, Activity activity, boolean z) {
        zzw zzwVar = (zzw) firebaseAuth.getFirebaseAuthSettings();
        SafetyNetClient client = z ? SafetyNet.getClient(firebaseAuth.getApp().getApplicationContext()) : null;
        zzbm zzbmVarZzc = zzbm.zzc();
        if (zzyz.zzg(firebaseAuth.getApp()) || zzwVar.zze()) {
            return Tasks.forResult(new zze(null, null));
        }
        TaskCompletionSource taskCompletionSource = new TaskCompletionSource();
        Task taskZzb = zzbmVarZzc.zzb();
        if (taskZzb != null) {
            if (taskZzb.isSuccessful()) {
                return Tasks.forResult(new zze(null, (String) taskZzb.getResult()));
            }
            String str2 = zza;
            Log.e(str2, "Error in previous reCAPTCHA flow: ".concat(String.valueOf(taskZzb.getException().getMessage())));
            Log.e(str2, "Continuing with application verification as normal");
        }
        if (client == null || zzwVar.zzc()) {
            zze(firebaseAuth, zzbmVarZzc, activity, taskCompletionSource);
        } else {
            FirebaseApp app = firebaseAuth.getApp();
            byte[] bytes = new byte[0];
            if (str != null) {
                try {
                    bytes = str.getBytes(Key.STRING_CHARSET_NAME);
                } catch (UnsupportedEncodingException e) {
                    Log.e(zza, "Failed to getBytes with exception: ".concat(String.valueOf(e.getMessage())));
                }
            }
            client.attest(bytes, app.getOptions().getApiKey()).addOnSuccessListener(new zzb(this, taskCompletionSource, firebaseAuth, zzbmVarZzc, activity)).addOnFailureListener(new zza(this, firebaseAuth, zzbmVarZzc, activity, taskCompletionSource));
        }
        return taskCompletionSource.getTask();
    }
}
