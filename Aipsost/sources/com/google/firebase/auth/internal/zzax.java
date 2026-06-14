package com.google.firebase.auth.internal;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.internal.safeparcel.SafeParcelableSerializer;
import com.google.android.gms.internal.p001firebaseauthapi.zzaay;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzax {
    private static zzax zza;
    private boolean zzb = false;
    private BroadcastReceiver zzc;

    private zzax() {
    }

    public static zzax zza() {
        if (zza == null) {
            zza = new zzax();
        }
        return zza;
    }

    static void zze(Context context) {
        zzax zzaxVar = zza;
        zzaxVar.zzb = false;
        if (zzaxVar.zzc != null) {
            LocalBroadcastManager.getInstance(context).unregisterReceiver(zza.zzc);
        }
        zza.zzc = null;
    }

    private final void zzh(Activity activity, BroadcastReceiver broadcastReceiver) {
        this.zzc = broadcastReceiver;
        LocalBroadcastManager.getInstance(activity).registerReceiver(broadcastReceiver, new IntentFilter("com.google.firebase.auth.ACTION_RECEIVE_FIREBASE_AUTH_INTENT"));
    }

    private static final AuthCredential zzi(Intent intent) {
        Preconditions.checkNotNull(intent);
        zzaay zzaayVar = (zzaay) SafeParcelableSerializer.deserializeFromIntentExtra(intent, "com.google.firebase.auth.internal.VERIFY_ASSERTION_REQUEST", zzaay.CREATOR);
        zzaayVar.zze(true);
        return com.google.firebase.auth.zze.zzb(zzaayVar);
    }

    public final boolean zzf(Activity activity, TaskCompletionSource taskCompletionSource, FirebaseAuth firebaseAuth, FirebaseUser firebaseUser) {
        if (this.zzb) {
            return false;
        }
        zzh(activity, new zzav(this, activity, taskCompletionSource, firebaseAuth, firebaseUser));
        this.zzb = true;
        return true;
    }

    public final boolean zzg(Activity activity, TaskCompletionSource taskCompletionSource) {
        if (this.zzb) {
            return false;
        }
        zzh(activity, new zzaw(this, activity, taskCompletionSource));
        this.zzb = true;
        return true;
    }
}
