package com.google.firebase.auth.internal;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.util.DefaultClock;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.core.ServerValues;

/* JADX INFO: compiled from: com.google.firebase:firebase-auth@@21.1.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzbm {
    private static final zzbm zza = new zzbm();
    private final zzbd zzb;
    private final zzax zzc;

    private zzbm() {
        zzbd zzbdVarZzc = zzbd.zzc();
        zzax zzaxVarZza = zzax.zza();
        this.zzb = zzbdVarZzc;
        this.zzc = zzaxVarZza;
    }

    public static zzbm zzc() {
        return zza;
    }

    public final Task zza() {
        return this.zzb.zza();
    }

    public final Task zzb() {
        return this.zzb.zzb();
    }

    public final void zzd(Context context) {
        this.zzb.zzd(context);
    }

    public final void zze(FirebaseAuth firebaseAuth) {
        this.zzb.zze(firebaseAuth);
    }

    public final void zzf(Context context, Status status) {
        SharedPreferences.Editor editorEdit = context.getSharedPreferences("com.google.firebase.auth.internal.ProcessDeathHelper", 0).edit();
        editorEdit.putInt("statusCode", status.getStatusCode());
        editorEdit.putString("statusMessage", status.getStatusMessage());
        editorEdit.putLong(ServerValues.NAME_OP_TIMESTAMP, DefaultClock.getInstance().currentTimeMillis());
        editorEdit.commit();
    }

    public final void zzg(Context context, FirebaseAuth firebaseAuth) {
        Preconditions.checkNotNull(context);
        Preconditions.checkNotNull(firebaseAuth);
        SharedPreferences.Editor editorEdit = context.getSharedPreferences("com.google.firebase.auth.internal.ProcessDeathHelper", 0).edit();
        editorEdit.putString("firebaseAppName", firebaseAuth.getApp().getName());
        editorEdit.commit();
    }

    public final void zzh(Context context, FirebaseAuth firebaseAuth, FirebaseUser firebaseUser) {
        Preconditions.checkNotNull(context);
        Preconditions.checkNotNull(firebaseAuth);
        Preconditions.checkNotNull(firebaseUser);
        SharedPreferences.Editor editorEdit = context.getSharedPreferences("com.google.firebase.auth.internal.ProcessDeathHelper", 0).edit();
        editorEdit.putString("firebaseAppName", firebaseAuth.getApp().getName());
        editorEdit.putString("firebaseUserUid", firebaseUser.getUid());
        editorEdit.commit();
    }

    public final boolean zzi(Activity activity, TaskCompletionSource taskCompletionSource, FirebaseAuth firebaseAuth) {
        return this.zzc.zzf(activity, taskCompletionSource, firebaseAuth, null);
    }

    public final boolean zzj(Activity activity, TaskCompletionSource taskCompletionSource, FirebaseAuth firebaseAuth, FirebaseUser firebaseUser) {
        return this.zzc.zzf(activity, taskCompletionSource, firebaseAuth, firebaseUser);
    }
}
