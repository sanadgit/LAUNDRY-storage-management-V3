package com.google.android.gms.measurement.internal;

import android.app.Activity;
import android.app.Application;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import kotlinx.coroutines.DebugKt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzhv implements Application.ActivityLifecycleCallbacks {
    final /* synthetic */ zzhw zza;

    /* synthetic */ zzhv(zzhw zzhwVar, zzhi zzhiVar) {
        this.zza = zzhwVar;
    }

    @Override // android.app.Application.ActivityLifecycleCallbacks
    public final void onActivityCreated(Activity activity, Bundle bundle) {
        zzfu zzfuVar;
        Uri data;
        try {
            try {
                this.zza.zzs.zzau().zzk().zza("onActivityCreated");
                Intent intent = activity.getIntent();
                if (intent == null || (data = intent.getData()) == null || !data.isHierarchical()) {
                    zzfuVar = this.zza.zzs;
                } else {
                    this.zza.zzs.zzl();
                    String stringExtra = intent.getStringExtra("android.intent.extra.REFERRER_NAME");
                    boolean z = true;
                    boolean z2 = "android-app://com.google.android.googlequicksearchbox/https/www.google.com".equals(stringExtra) || "https://www.google.com".equals(stringExtra) || "android-app://com.google.appcrawler".equals(stringExtra);
                    String str = true != z2 ? DebugKt.DEBUG_PROPERTY_VALUE_AUTO : "gs";
                    String queryParameter = data.getQueryParameter("referrer");
                    if (bundle != null) {
                        z = false;
                    }
                    this.zza.zzs.zzav().zzh(new zzhu(this, z, data, str, queryParameter));
                    zzfuVar = this.zza.zzs;
                }
            } catch (RuntimeException e) {
                this.zza.zzs.zzau().zzb().zzb("Throwable caught in onActivityCreated", e);
                zzfuVar = this.zza.zzs;
            }
            zzfuVar.zzx().zzo(activity, bundle);
        } catch (Throwable th) {
            this.zza.zzs.zzx().zzo(activity, bundle);
            throw th;
        }
    }

    @Override // android.app.Application.ActivityLifecycleCallbacks
    public final void onActivityDestroyed(Activity activity) {
        this.zza.zzs.zzx().zzt(activity);
    }

    @Override // android.app.Application.ActivityLifecycleCallbacks
    public final void onActivityPaused(Activity activity) {
        this.zza.zzs.zzx().zzr(activity);
        zzjz zzjzVarZzh = this.zza.zzs.zzh();
        zzjzVarZzh.zzs.zzav().zzh(new zzjs(zzjzVarZzh, zzjzVarZzh.zzs.zzay().elapsedRealtime()));
    }

    @Override // android.app.Application.ActivityLifecycleCallbacks
    public final void onActivityResumed(Activity activity) {
        zzjz zzjzVarZzh = this.zza.zzs.zzh();
        zzjzVarZzh.zzs.zzav().zzh(new zzjr(zzjzVarZzh, zzjzVarZzh.zzs.zzay().elapsedRealtime()));
        this.zza.zzs.zzx().zzq(activity);
    }

    @Override // android.app.Application.ActivityLifecycleCallbacks
    public final void onActivitySaveInstanceState(Activity activity, Bundle bundle) {
        this.zza.zzs.zzx().zzs(activity, bundle);
    }

    @Override // android.app.Application.ActivityLifecycleCallbacks
    public final void onActivityStarted(Activity activity) {
    }

    @Override // android.app.Application.ActivityLifecycleCallbacks
    public final void onActivityStopped(Activity activity) {
    }
}
