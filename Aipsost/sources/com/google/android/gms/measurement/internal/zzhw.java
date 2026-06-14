package com.google.android.gms.measurement.internal;

import android.app.Application;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.os.Parcelable;
import android.text.TextUtils;
import androidx.collection.ArrayMap;
import androidx.core.app.NotificationCompat;
import com.aipsoft.aipsoftconnect.utils.Constant;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.util.CollectionUtils;
import com.google.android.gms.common.util.Strings;
import com.google.android.gms.internal.measurement.zzoa;
import com.google.android.gms.internal.measurement.zzom;
import com.google.android.gms.measurement.api.AppMeasurementSdk;
import com.google.firebase.analytics.FirebaseAnalytics;
import com.google.firebase.messaging.Constants;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import kotlinx.coroutines.DebugKt;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzhw extends zzf {
    protected zzhv zza;
    final zzr zzb;
    protected boolean zzc;
    private zzgu zzd;
    private final Set<zzgv> zze;
    private boolean zzf;
    private final AtomicReference<String> zzg;
    private final Object zzh;
    private zzaf zzi;
    private int zzj;
    private final AtomicLong zzk;
    private long zzl;
    private int zzm;
    private final zzkt zzn;

    protected zzhw(zzfu zzfuVar) {
        super(zzfuVar);
        this.zze = new CopyOnWriteArraySet();
        this.zzh = new Object();
        this.zzc = true;
        this.zzn = new zzhl(this);
        this.zzg = new AtomicReference<>();
        this.zzi = new zzaf(null, null);
        this.zzj = 100;
        this.zzl = -1L;
        this.zzm = 100;
        this.zzk = new AtomicLong(0L);
        this.zzb = new zzr(zzfuVar);
    }

    static /* synthetic */ void zzW(zzhw zzhwVar, zzaf zzafVar, int i, long j, boolean z, boolean z2) {
        zzhwVar.zzg();
        zzhwVar.zzb();
        if (j <= zzhwVar.zzl && zzaf.zzm(zzhwVar.zzm, i)) {
            zzhwVar.zzs.zzau().zzi().zzb("Dropped out-of-date consent setting, proposed settings", zzafVar);
            return;
        }
        zzfb zzfbVarZzd = zzhwVar.zzs.zzd();
        zzfu zzfuVar = zzfbVarZzd.zzs;
        zzfbVarZzd.zzg();
        if (!zzfbVarZzd.zzh(i)) {
            zzhwVar.zzs.zzau().zzi().zzb("Lower precedence consent source ignored, proposed source", Integer.valueOf(i));
            return;
        }
        SharedPreferences.Editor editorEdit = zzfbVarZzd.zzd().edit();
        editorEdit.putString("consent_settings", zzafVar.zzd());
        editorEdit.putInt("consent_source", i);
        editorEdit.apply();
        zzhwVar.zzl = j;
        zzhwVar.zzm = i;
        zzhwVar.zzs.zzy().zzj(z);
        if (z2) {
            zzhwVar.zzs.zzy().zzv(new AtomicReference<>());
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zzY(Boolean bool, boolean z) {
        zzg();
        zzb();
        this.zzs.zzau().zzj().zzb("Setting app measurement enabled (FE)", bool);
        this.zzs.zzd().zze(bool);
        if (z) {
            zzfb zzfbVarZzd = this.zzs.zzd();
            zzfu zzfuVar = zzfbVarZzd.zzs;
            zzfbVarZzd.zzg();
            SharedPreferences.Editor editorEdit = zzfbVarZzd.zzd().edit();
            if (bool != null) {
                editorEdit.putBoolean("measurement_enabled_from_api", bool.booleanValue());
            } else {
                editorEdit.remove("measurement_enabled_from_api");
            }
            editorEdit.apply();
        }
        if (this.zzs.zzI() || !(bool == null || bool.booleanValue())) {
            zzZ();
        }
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zzZ() {
        zzg();
        String strZza = this.zzs.zzd().zzh.zza();
        if (strZza != null) {
            if ("unset".equals(strZza)) {
                zzB("app", "_npa", null, this.zzs.zzay().currentTimeMillis());
            } else {
                zzB("app", "_npa", Long.valueOf(true != "true".equals(strZza) ? 0L : 1L), this.zzs.zzay().currentTimeMillis());
            }
        }
        if (!this.zzs.zzF() || !this.zzc) {
            this.zzs.zzau().zzj().zza("Updating Scion state (FE)");
            this.zzs.zzy().zzi();
            return;
        }
        this.zzs.zzau().zzj().zza("Recording app launch after enabling measurement for the first time (FE)");
        zzH();
        zzom.zzb();
        if (this.zzs.zzc().zzn(null, zzea.zzan)) {
            this.zzs.zzh().zza.zza();
        }
        this.zzs.zzav().zzh(new zzha(this));
    }

    final void zzA(String str, String str2, long j, Object obj) {
        this.zzs.zzav().zzh(new zzhd(this, str, str2, obj, j));
    }

    /* JADX WARN: Removed duplicated region for block: B:17:0x0056  */
    /* JADX WARN: Removed duplicated region for block: B:19:0x0068  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    final void zzB(java.lang.String r9, java.lang.String r10, java.lang.Object r11, long r12) {
        /*
            r8 = this;
            com.google.android.gms.common.internal.Preconditions.checkNotEmpty(r9)
            com.google.android.gms.common.internal.Preconditions.checkNotEmpty(r10)
            r8.zzg()
            r8.zzb()
            java.lang.String r0 = "allow_personalized_ads"
            boolean r0 = r0.equals(r10)
            if (r0 == 0) goto L68
            boolean r0 = r11 instanceof java.lang.String
            java.lang.String r1 = "_npa"
            if (r0 == 0) goto L56
            r0 = r11
            java.lang.String r0 = (java.lang.String) r0
            boolean r2 = android.text.TextUtils.isEmpty(r0)
            if (r2 != 0) goto L56
            java.util.Locale r10 = java.util.Locale.ENGLISH
            java.lang.String r10 = r0.toLowerCase(r10)
            java.lang.String r11 = "false"
            boolean r10 = r11.equals(r10)
            r2 = 1
            r0 = 1
            if (r0 == r10) goto L37
            r4 = 0
            goto L38
        L37:
            r4 = r2
        L38:
            java.lang.Long r10 = java.lang.Long.valueOf(r4)
            com.google.android.gms.measurement.internal.zzfu r0 = r8.zzs
            com.google.android.gms.measurement.internal.zzfb r0 = r0.zzd()
            com.google.android.gms.measurement.internal.zzfa r0 = r0.zzh
            long r4 = r10.longValue()
            int r6 = (r4 > r2 ? 1 : (r4 == r2 ? 0 : -1))
            if (r6 != 0) goto L4f
            java.lang.String r11 = "true"
            goto L50
        L4f:
        L50:
            r0.zzb(r11)
            r6 = r10
            r3 = r1
            goto L6b
        L56:
            if (r11 != 0) goto L68
            com.google.android.gms.measurement.internal.zzfu r10 = r8.zzs
            com.google.android.gms.measurement.internal.zzfb r10 = r10.zzd()
            com.google.android.gms.measurement.internal.zzfa r10 = r10.zzh
            java.lang.String r0 = "unset"
            r10.zzb(r0)
            r6 = r11
            r3 = r1
            goto L6b
        L68:
            r3 = r10
            r6 = r11
        L6b:
            com.google.android.gms.measurement.internal.zzfu r10 = r8.zzs
            boolean r10 = r10.zzF()
            if (r10 != 0) goto L83
            com.google.android.gms.measurement.internal.zzfu r9 = r8.zzs
            com.google.android.gms.measurement.internal.zzem r9 = r9.zzau()
            com.google.android.gms.measurement.internal.zzek r9 = r9.zzk()
            java.lang.String r10 = "User property not set since app measurement is disabled"
            r9.zza(r10)
            return
        L83:
            com.google.android.gms.measurement.internal.zzfu r10 = r8.zzs
            boolean r10 = r10.zzL()
            if (r10 != 0) goto L8c
            return
        L8c:
            com.google.android.gms.measurement.internal.zzkq r10 = new com.google.android.gms.measurement.internal.zzkq
            r2 = r10
            r4 = r12
            r7 = r9
            r2.<init>(r3, r4, r6, r7)
            com.google.android.gms.measurement.internal.zzfu r9 = r8.zzs
            com.google.android.gms.measurement.internal.zzjk r9 = r9.zzy()
            r9.zzs(r10)
            return
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzhw.zzB(java.lang.String, java.lang.String, java.lang.Object, long):void");
    }

    public final List<zzkq> zzC(boolean z) {
        zzb();
        this.zzs.zzau().zzk().zza("Getting user properties (FE)");
        if (this.zzs.zzav().zzd()) {
            this.zzs.zzau().zzb().zza("Cannot get all user properties from analytics worker thread");
            return Collections.emptyList();
        }
        this.zzs.zzat();
        if (zzz.zza()) {
            this.zzs.zzau().zzb().zza("Cannot get all user properties from main thread");
            return Collections.emptyList();
        }
        AtomicReference atomicReference = new AtomicReference();
        this.zzs.zzav().zzi(atomicReference, Constant.LOCATION_UPDATE_INTERVAL, "get user properties", new zzhe(this, atomicReference, z));
        List<zzkq> list = (List) atomicReference.get();
        if (list != null) {
            return list;
        }
        this.zzs.zzau().zzb().zzb("Timed out waiting for get user properties, includeInternal", Boolean.valueOf(z));
        return Collections.emptyList();
    }

    public final String zzD() {
        return this.zzg.get();
    }

    final void zzE(String str) {
        this.zzg.set(str);
    }

    public final void zzF(long j) {
        this.zzg.set(null);
        this.zzs.zzav().zzh(new zzhf(this, j));
    }

    final void zzG(long j, boolean z) {
        zzg();
        zzb();
        this.zzs.zzau().zzj().zza("Resetting analytics data (FE)");
        zzjz zzjzVarZzh = this.zzs.zzh();
        zzjzVarZzh.zzg();
        zzjy zzjyVar = zzjzVarZzh.zza;
        zzjzVarZzh.zzb.zzc();
        boolean zZzF = this.zzs.zzF();
        zzfb zzfbVarZzd = this.zzs.zzd();
        zzfbVarZzd.zzc.zzb(j);
        if (!TextUtils.isEmpty(zzfbVarZzd.zzs.zzd().zzo.zza())) {
            zzfbVarZzd.zzo.zzb(null);
        }
        zzom.zzb();
        if (zzfbVarZzd.zzs.zzc().zzn(null, zzea.zzan)) {
            zzfbVarZzd.zzj.zzb(0L);
        }
        if (!zzfbVarZzd.zzs.zzc().zzr()) {
            zzfbVarZzd.zzj(!zZzF);
        }
        zzfbVarZzd.zzp.zzb(null);
        zzfbVarZzd.zzq.zzb(0L);
        zzfbVarZzd.zzr.zzb(null);
        if (z) {
            this.zzs.zzy().zzu();
        }
        zzom.zzb();
        if (this.zzs.zzc().zzn(null, zzea.zzan)) {
            this.zzs.zzh().zza.zza();
        }
        this.zzc = !zZzF;
    }

    public final void zzH() {
        zzg();
        zzb();
        if (this.zzs.zzL()) {
            if (this.zzs.zzc().zzn(null, zzea.zzaa)) {
                zzae zzaeVarZzc = this.zzs.zzc();
                zzaeVarZzc.zzs.zzat();
                Boolean boolZzp = zzaeVarZzc.zzp("google_analytics_deferred_deep_link_enabled");
                if (boolZzp != null && boolZzp.booleanValue()) {
                    this.zzs.zzau().zzj().zza("Deferred Deep Link feature enabled.");
                    this.zzs.zzav().zzh(new Runnable(this) { // from class: com.google.android.gms.measurement.internal.zzgy
                        private final zzhw zza;

                        {
                            this.zza = this;
                        }

                        @Override // java.lang.Runnable
                        public final void run() {
                            zzhw zzhwVar = this.zza;
                            zzhwVar.zzg();
                            if (zzhwVar.zzs.zzd().zzm.zza()) {
                                zzhwVar.zzs.zzau().zzj().zza("Deferred Deep Link already retrieved. Not fetching again.");
                                return;
                            }
                            long jZza = zzhwVar.zzs.zzd().zzn.zza();
                            zzhwVar.zzs.zzd().zzn.zzb(1 + jZza);
                            zzhwVar.zzs.zzc();
                            if (jZza < 5) {
                                zzhwVar.zzs.zzM();
                            } else {
                                zzhwVar.zzs.zzau().zze().zza("Permanently failed to retrieve Deferred Deep Link. Reached maximum retries.");
                                zzhwVar.zzs.zzd().zzm.zzb(true);
                            }
                        }
                    });
                }
            }
            this.zzs.zzy().zzy();
            this.zzc = false;
            zzfb zzfbVarZzd = this.zzs.zzd();
            zzfbVarZzd.zzg();
            String string = zzfbVarZzd.zzd().getString("previous_os_version", null);
            zzfbVarZzd.zzs.zzz().zzv();
            String str = Build.VERSION.RELEASE;
            if (!TextUtils.isEmpty(str) && !str.equals(string)) {
                SharedPreferences.Editor editorEdit = zzfbVarZzd.zzd().edit();
                editorEdit.putString("previous_os_version", str);
                editorEdit.apply();
            }
            if (TextUtils.isEmpty(string)) {
                return;
            }
            this.zzs.zzz().zzv();
            if (string.equals(Build.VERSION.RELEASE)) {
                return;
            }
            Bundle bundle = new Bundle();
            bundle.putString("_po", string);
            zzs(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_ou", bundle);
        }
    }

    public final void zzI(zzgu zzguVar) {
        zzgu zzguVar2;
        zzg();
        zzb();
        if (zzguVar != null && zzguVar != (zzguVar2 = this.zzd)) {
            Preconditions.checkState(zzguVar2 == null, "EventInterceptor already set.");
        }
        this.zzd = zzguVar;
    }

    public final void zzJ(zzgv zzgvVar) {
        zzb();
        Preconditions.checkNotNull(zzgvVar);
        if (this.zze.add(zzgvVar)) {
            return;
        }
        this.zzs.zzau().zze().zza("OnEventListener already registered");
    }

    public final void zzK(zzgv zzgvVar) {
        zzb();
        Preconditions.checkNotNull(zzgvVar);
        if (this.zze.remove(zzgvVar)) {
            return;
        }
        this.zzs.zzau().zze().zza("OnEventListener had not been registered");
    }

    public final int zzL(String str) {
        Preconditions.checkNotEmpty(str);
        this.zzs.zzc();
        return 25;
    }

    public final void zzM(Bundle bundle) {
        zzN(bundle, this.zzs.zzay().currentTimeMillis());
    }

    public final void zzN(Bundle bundle, long j) {
        Preconditions.checkNotNull(bundle);
        Bundle bundle2 = new Bundle(bundle);
        if (!TextUtils.isEmpty(bundle2.getString("app_id"))) {
            this.zzs.zzau().zze().zza("Package name should be null when calling setConditionalUserProperty");
        }
        bundle2.remove("app_id");
        Preconditions.checkNotNull(bundle2);
        zzgq.zzb(bundle2, "app_id", String.class, null);
        zzgq.zzb(bundle2, "origin", String.class, null);
        zzgq.zzb(bundle2, AppMeasurementSdk.ConditionalUserProperty.NAME, String.class, null);
        zzgq.zzb(bundle2, "value", Object.class, null);
        zzgq.zzb(bundle2, AppMeasurementSdk.ConditionalUserProperty.TRIGGER_EVENT_NAME, String.class, null);
        zzgq.zzb(bundle2, AppMeasurementSdk.ConditionalUserProperty.TRIGGER_TIMEOUT, Long.class, 0L);
        zzgq.zzb(bundle2, AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_NAME, String.class, null);
        zzgq.zzb(bundle2, AppMeasurementSdk.ConditionalUserProperty.TIMED_OUT_EVENT_PARAMS, Bundle.class, null);
        zzgq.zzb(bundle2, AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_NAME, String.class, null);
        zzgq.zzb(bundle2, AppMeasurementSdk.ConditionalUserProperty.TRIGGERED_EVENT_PARAMS, Bundle.class, null);
        zzgq.zzb(bundle2, AppMeasurementSdk.ConditionalUserProperty.TIME_TO_LIVE, Long.class, 0L);
        zzgq.zzb(bundle2, AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_NAME, String.class, null);
        zzgq.zzb(bundle2, AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_PARAMS, Bundle.class, null);
        Preconditions.checkNotEmpty(bundle2.getString(AppMeasurementSdk.ConditionalUserProperty.NAME));
        Preconditions.checkNotEmpty(bundle2.getString("origin"));
        Preconditions.checkNotNull(bundle2.get("value"));
        bundle2.putLong(AppMeasurementSdk.ConditionalUserProperty.CREATION_TIMESTAMP, j);
        String string = bundle2.getString(AppMeasurementSdk.ConditionalUserProperty.NAME);
        Object obj = bundle2.get("value");
        if (this.zzs.zzl().zzo(string) != 0) {
            this.zzs.zzau().zzb().zzb("Invalid conditional user property name", this.zzs.zzm().zze(string));
            return;
        }
        if (this.zzs.zzl().zzJ(string, obj) != 0) {
            this.zzs.zzau().zzb().zzc("Invalid conditional user property value", this.zzs.zzm().zze(string), obj);
            return;
        }
        Object objZzK = this.zzs.zzl().zzK(string, obj);
        if (objZzK == null) {
            this.zzs.zzau().zzb().zzc("Unable to normalize conditional user property value", this.zzs.zzm().zze(string), obj);
            return;
        }
        zzgq.zza(bundle2, objZzK);
        long j2 = bundle2.getLong(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_TIMEOUT);
        if (!TextUtils.isEmpty(bundle2.getString(AppMeasurementSdk.ConditionalUserProperty.TRIGGER_EVENT_NAME))) {
            this.zzs.zzc();
            if (j2 > 15552000000L || j2 < 1) {
                this.zzs.zzau().zzb().zzc("Invalid conditional user property timeout", this.zzs.zzm().zze(string), Long.valueOf(j2));
                return;
            }
        }
        long j3 = bundle2.getLong(AppMeasurementSdk.ConditionalUserProperty.TIME_TO_LIVE);
        this.zzs.zzc();
        if (j3 > 15552000000L || j3 < 1) {
            this.zzs.zzau().zzb().zzc("Invalid conditional user property time to live", this.zzs.zzm().zze(string), Long.valueOf(j3));
        } else {
            this.zzs.zzav().zzh(new zzhg(this, bundle2));
        }
    }

    public final void zzO(String str, String str2, Bundle bundle) {
        long jCurrentTimeMillis = this.zzs.zzay().currentTimeMillis();
        Preconditions.checkNotEmpty(str);
        Bundle bundle2 = new Bundle();
        bundle2.putString(AppMeasurementSdk.ConditionalUserProperty.NAME, str);
        bundle2.putLong(AppMeasurementSdk.ConditionalUserProperty.CREATION_TIMESTAMP, jCurrentTimeMillis);
        if (str2 != null) {
            bundle2.putString(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_NAME, str2);
            bundle2.putBundle(AppMeasurementSdk.ConditionalUserProperty.EXPIRED_EVENT_PARAMS, bundle);
        }
        this.zzs.zzav().zzh(new zzhh(this, bundle2));
    }

    public final ArrayList<Bundle> zzP(String str, String str2) {
        if (this.zzs.zzav().zzd()) {
            this.zzs.zzau().zzb().zza("Cannot get conditional user properties from analytics worker thread");
            return new ArrayList<>(0);
        }
        this.zzs.zzat();
        if (zzz.zza()) {
            this.zzs.zzau().zzb().zza("Cannot get conditional user properties from main thread");
            return new ArrayList<>(0);
        }
        AtomicReference atomicReference = new AtomicReference();
        this.zzs.zzav().zzi(atomicReference, Constant.LOCATION_UPDATE_INTERVAL, "get conditional user properties", new zzhj(this, atomicReference, null, str, str2));
        List list = (List) atomicReference.get();
        if (list != null) {
            return zzku.zzak(list);
        }
        this.zzs.zzau().zzb().zzb("Timed out waiting for get conditional user properties", null);
        return new ArrayList<>();
    }

    public final Map<String, Object> zzQ(String str, String str2, boolean z) {
        if (this.zzs.zzav().zzd()) {
            this.zzs.zzau().zzb().zza("Cannot get user properties from analytics worker thread");
            return Collections.emptyMap();
        }
        this.zzs.zzat();
        if (zzz.zza()) {
            this.zzs.zzau().zzb().zza("Cannot get user properties from main thread");
            return Collections.emptyMap();
        }
        AtomicReference atomicReference = new AtomicReference();
        this.zzs.zzav().zzi(atomicReference, Constant.LOCATION_UPDATE_INTERVAL, "get user properties", new zzhk(this, atomicReference, null, str, str2, z));
        List<zzkq> list = (List) atomicReference.get();
        if (list == null) {
            this.zzs.zzau().zzb().zzb("Timed out waiting for handle get user properties, includeInternal", Boolean.valueOf(z));
            return Collections.emptyMap();
        }
        ArrayMap arrayMap = new ArrayMap(list.size());
        for (zzkq zzkqVar : list) {
            Object objZza = zzkqVar.zza();
            if (objZza != null) {
                arrayMap.put(zzkqVar.zzb, objZza);
            }
        }
        return arrayMap;
    }

    public final String zzR() {
        zzid zzidVarZzl = this.zzs.zzx().zzl();
        if (zzidVarZzl != null) {
            return zzidVarZzl.zza;
        }
        return null;
    }

    public final String zzS() {
        zzid zzidVarZzl = this.zzs.zzx().zzl();
        if (zzidVarZzl != null) {
            return zzidVarZzl.zzb;
        }
        return null;
    }

    public final String zzT() {
        if (this.zzs.zzr() != null) {
            return this.zzs.zzr();
        }
        try {
            return zzic.zza(this.zzs.zzax(), "google_app_id", this.zzs.zzv());
        } catch (IllegalStateException e) {
            this.zzs.zzau().zzb().zzb("getGoogleAppId failed with exception", e);
            return null;
        }
    }

    final /* synthetic */ void zzU(Bundle bundle) {
        if (bundle == null) {
            this.zzs.zzd().zzr.zzb(new Bundle());
            return;
        }
        Bundle bundleZza = this.zzs.zzd().zzr.zza();
        for (String str : bundle.keySet()) {
            Object obj = bundle.get(str);
            if (obj != null && !(obj instanceof String) && !(obj instanceof Long) && !(obj instanceof Double)) {
                if (this.zzs.zzl().zzs(obj)) {
                    this.zzs.zzl().zzM(this.zzn, null, 27, null, null, 0, this.zzs.zzc().zzn(null, zzea.zzaw));
                }
                this.zzs.zzau().zzh().zzc("Invalid default event parameter type. Name, value", str, obj);
            } else if (zzku.zzR(str)) {
                this.zzs.zzau().zzh().zzb("Invalid default event parameter name. Name", str);
            } else if (obj == null) {
                bundleZza.remove(str);
            } else {
                zzku zzkuVarZzl = this.zzs.zzl();
                this.zzs.zzc();
                if (zzkuVarZzl.zzt("param", str, 100, obj)) {
                    this.zzs.zzl().zzL(bundleZza, str, obj);
                }
            }
        }
        this.zzs.zzl();
        int iZzc = this.zzs.zzc().zzc();
        if (bundleZza.size() > iZzc) {
            int i = 0;
            for (String str2 : new TreeSet(bundleZza.keySet())) {
                i++;
                if (i > iZzc) {
                    bundleZza.remove(str2);
                }
            }
            this.zzs.zzl().zzM(this.zzn, null, 26, null, null, 0, this.zzs.zzc().zzn(null, zzea.zzaw));
            this.zzs.zzau().zzh().zza("Too many default event parameters set. Discarding beyond event parameter limit");
        }
        this.zzs.zzd().zzr.zzb(bundleZza);
        this.zzs.zzy().zzA(bundleZza);
    }

    @Override // com.google.android.gms.measurement.internal.zzf
    protected final boolean zze() {
        return false;
    }

    public final void zzh() {
        if (!(this.zzs.zzax().getApplicationContext() instanceof Application) || this.zza == null) {
            return;
        }
        ((Application) this.zzs.zzax().getApplicationContext()).unregisterActivityLifecycleCallbacks(this.zza);
    }

    public final Boolean zzi() {
        AtomicReference atomicReference = new AtomicReference();
        return (Boolean) this.zzs.zzav().zzi(atomicReference, 15000L, "boolean test flag value", new zzhi(this, atomicReference));
    }

    public final String zzj() {
        AtomicReference atomicReference = new AtomicReference();
        return (String) this.zzs.zzav().zzi(atomicReference, 15000L, "String test flag value", new zzhm(this, atomicReference));
    }

    public final Long zzk() {
        AtomicReference atomicReference = new AtomicReference();
        return (Long) this.zzs.zzav().zzi(atomicReference, 15000L, "long test flag value", new zzhn(this, atomicReference));
    }

    public final Integer zzl() {
        AtomicReference atomicReference = new AtomicReference();
        return (Integer) this.zzs.zzav().zzi(atomicReference, 15000L, "int test flag value", new zzho(this, atomicReference));
    }

    public final Double zzm() {
        AtomicReference atomicReference = new AtomicReference();
        return (Double) this.zzs.zzav().zzi(atomicReference, 15000L, "double test flag value", new zzhp(this, atomicReference));
    }

    public final void zzn(Boolean bool) {
        zzb();
        this.zzs.zzav().zzh(new zzhq(this, bool));
    }

    public final void zzo(Bundle bundle, int i, long j) {
        zzb();
        String strZza = zzaf.zza(bundle);
        if (strZza != null) {
            this.zzs.zzau().zzh().zzb("Ignoring invalid consent setting", strZza);
            this.zzs.zzau().zzh().zza("Valid consent values are 'granted', 'denied'");
        }
        zzq(zzaf.zzb(bundle), i, j);
    }

    public final void zzq(zzaf zzafVar, int i, long j) {
        boolean z;
        zzaf zzafVar2;
        boolean z2;
        boolean zZzi;
        zzb();
        if (i != -10 && zzafVar.zze() == null && zzafVar.zzg() == null) {
            this.zzs.zzau().zzh().zza("Discarding empty consent settings");
            return;
        }
        synchronized (this.zzh) {
            z = false;
            if (zzaf.zzm(i, this.zzj)) {
                zZzi = zzafVar.zzi(this.zzi);
                if (zzafVar.zzh() && !this.zzi.zzh()) {
                    z = true;
                }
                zzaf zzafVarZzl = zzafVar.zzl(this.zzi);
                this.zzi = zzafVarZzl;
                this.zzj = i;
                zzafVar2 = zzafVarZzl;
                z2 = z;
                z = true;
            } else {
                zzafVar2 = zzafVar;
                z2 = false;
                zZzi = false;
            }
        }
        if (!z) {
            this.zzs.zzau().zzi().zzb("Ignoring lower-priority consent settings, proposed settings", zzafVar2);
            return;
        }
        long andIncrement = this.zzk.getAndIncrement();
        if (zZzi) {
            this.zzg.set(null);
            this.zzs.zzav().zzj(new zzhr(this, zzafVar2, j, i, andIncrement, z2));
        } else if (i == 30 || i == -10) {
            this.zzs.zzav().zzj(new zzhs(this, zzafVar2, i, andIncrement, z2));
        } else {
            this.zzs.zzav().zzh(new zzht(this, zzafVar2, i, andIncrement, z2));
        }
    }

    final void zzr(zzaf zzafVar) {
        zzg();
        boolean z = (zzafVar.zzh() && zzafVar.zzf()) || this.zzs.zzy().zzH();
        if (z != this.zzs.zzI()) {
            this.zzs.zzH(z);
            zzfb zzfbVarZzd = this.zzs.zzd();
            zzfu zzfuVar = zzfbVarZzd.zzs;
            zzfbVarZzd.zzg();
            Boolean boolValueOf = zzfbVarZzd.zzd().contains("measurement_enabled_from_api") ? Boolean.valueOf(zzfbVarZzd.zzd().getBoolean("measurement_enabled_from_api", true)) : null;
            if (!z || boolValueOf == null || boolValueOf.booleanValue()) {
                zzY(Boolean.valueOf(z), false);
            }
        }
    }

    public final void zzs(String str, String str2, Bundle bundle) {
        zzv(str, str2, bundle, true, true, this.zzs.zzay().currentTimeMillis());
    }

    final void zzt(String str, String str2, long j, Bundle bundle) {
        zzg();
        boolean z = this.zzd == null || zzku.zzR(str2);
        zzu(str, str2, j, bundle, true, z, false, null);
    }

    protected final void zzu(String str, String str2, long j, Bundle bundle, boolean z, boolean z2, boolean z3, String str3) {
        boolean z4;
        String str4;
        String str5;
        Bundle bundle2;
        ArrayList arrayList;
        Bundle[] bundleArr;
        Preconditions.checkNotEmpty(str);
        Preconditions.checkNotNull(bundle);
        zzg();
        zzb();
        if (!this.zzs.zzF()) {
            this.zzs.zzau().zzj().zza("Event not sent since app measurement is disabled");
            return;
        }
        List<String> listZzo = this.zzs.zzA().zzo();
        if (listZzo != null && !listZzo.contains(str2)) {
            this.zzs.zzau().zzj().zzc("Dropping non-safelisted event. event name, origin", str2, str);
            return;
        }
        if (!this.zzf) {
            this.zzf = true;
            try {
                try {
                    (!this.zzs.zzu() ? Class.forName("com.google.android.gms.tagmanager.TagManagerService", true, this.zzs.zzax().getClassLoader()) : Class.forName("com.google.android.gms.tagmanager.TagManagerService")).getDeclaredMethod("initialize", Context.class).invoke(null, this.zzs.zzax());
                } catch (Exception e) {
                    this.zzs.zzau().zze().zzb("Failed to invoke Tag Manager's initialize() method", e);
                }
            } catch (ClassNotFoundException e2) {
                this.zzs.zzau().zzi().zza("Tag Manager is not found and thus will not be used");
            }
        }
        if (this.zzs.zzc().zzn(null, zzea.zzab) && Constants.ScionAnalytics.EVENT_FIREBASE_CAMPAIGN.equals(str2) && bundle.containsKey("gclid")) {
            this.zzs.zzat();
            zzB(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_lgclid", bundle.getString("gclid"), this.zzs.zzay().currentTimeMillis());
        }
        this.zzs.zzat();
        if (z && zzku.zzY(str2)) {
            this.zzs.zzl().zzH(bundle, this.zzs.zzd().zzr.zza());
        }
        if (z3) {
            this.zzs.zzat();
            if (!"_iap".equals(str2)) {
                zzku zzkuVarZzl = this.zzs.zzl();
                int i = 2;
                if (zzkuVarZzl.zzj(NotificationCompat.CATEGORY_EVENT, str2)) {
                    if (zzkuVarZzl.zzl(NotificationCompat.CATEGORY_EVENT, zzgr.zza, zzgr.zzb, str2)) {
                        zzkuVarZzl.zzs.zzc();
                        if (zzkuVarZzl.zzm(NotificationCompat.CATEGORY_EVENT, 40, str2)) {
                            i = 0;
                        }
                    } else {
                        i = 13;
                    }
                }
                if (i != 0) {
                    this.zzs.zzau().zzd().zzb("Invalid public event name. Event will not be logged (FE)", this.zzs.zzm().zzc(str2));
                    zzku zzkuVarZzl2 = this.zzs.zzl();
                    this.zzs.zzc();
                    this.zzs.zzl().zzM(this.zzn, null, i, "_ev", zzkuVarZzl2.zzC(str2, 40, true), str2 != null ? str2.length() : 0, this.zzs.zzc().zzn(null, zzea.zzaw));
                    return;
                }
            }
        }
        this.zzs.zzat();
        zzid zzidVarZzh = this.zzs.zzx().zzh(false);
        if (zzidVarZzh != null && !bundle.containsKey("_sc")) {
            zzidVarZzh.zzd = true;
        }
        zzik.zzm(zzidVarZzh, bundle, z && z3);
        boolean zEquals = "am".equals(str);
        boolean zZzR = zzku.zzR(str2);
        if (!z || this.zzd == null || zZzR) {
            z4 = zEquals;
        } else {
            if (!zEquals) {
                this.zzs.zzau().zzj().zzc("Passing event to registered event handler (FE)", this.zzs.zzm().zzc(str2), this.zzs.zzm().zzf(bundle));
                Preconditions.checkNotNull(this.zzd);
                this.zzd.interceptEvent(str, str2, bundle, j);
                return;
            }
            z4 = true;
        }
        if (this.zzs.zzL()) {
            int iZzn = this.zzs.zzl().zzn(str2);
            if (iZzn != 0) {
                this.zzs.zzau().zzd().zzb("Invalid event name. Event will not be logged (FE)", this.zzs.zzm().zzc(str2));
                zzku zzkuVarZzl3 = this.zzs.zzl();
                this.zzs.zzc();
                this.zzs.zzl().zzM(this.zzn, str3, iZzn, "_ev", zzkuVarZzl3.zzC(str2, 40, true), str2 != null ? str2.length() : 0, this.zzs.zzc().zzn(null, zzea.zzaw));
                return;
            }
            String str6 = "_o";
            Bundle bundleZzF = this.zzs.zzl().zzF(str3, str2, bundle, CollectionUtils.listOf((Object[]) new String[]{"_o", "_sn", "_sc", "_si"}), z3);
            Preconditions.checkNotNull(bundleZzF);
            if (bundleZzF.containsKey("_sc") && bundleZzF.containsKey("_si")) {
                new zzid(bundleZzF.getString("_sn"), bundleZzF.getString("_sc"), bundleZzF.getLong("_si"));
            }
            this.zzs.zzat();
            if (this.zzs.zzx().zzh(false) == null || !"_ae".equals(str2)) {
                str4 = "_ae";
            } else {
                zzjx zzjxVar = this.zzs.zzh().zzb;
                long jElapsedRealtime = zzjxVar.zzc.zzs.zzay().elapsedRealtime();
                str4 = "_ae";
                long j2 = jElapsedRealtime - zzjxVar.zzb;
                zzjxVar.zzb = jElapsedRealtime;
                if (j2 > 0) {
                    this.zzs.zzl().zzac(bundleZzF, j2);
                }
            }
            zzoa.zzb();
            if (!this.zzs.zzc().zzn(null, zzea.zzam)) {
                str5 = str4;
            } else if (DebugKt.DEBUG_PROPERTY_VALUE_AUTO.equals(str) || !"_ssr".equals(str2)) {
                str5 = str4;
                if (str5.equals(str2)) {
                    String strZza = this.zzs.zzl().zzs.zzd().zzo.zza();
                    if (!TextUtils.isEmpty(strZza)) {
                        bundleZzF.putString("_ffr", strZza);
                    }
                }
            } else {
                zzku zzkuVarZzl4 = this.zzs.zzl();
                String string = bundleZzF.getString("_ffr");
                if (Strings.isEmptyOrWhitespace(string)) {
                    string = null;
                } else if (string != null) {
                    string = string.trim();
                }
                if (zzku.zzS(string, zzkuVarZzl4.zzs.zzd().zzo.zza())) {
                    zzkuVarZzl4.zzs.zzau().zzj().zza("Not logging duplicate session_start_with_rollout event");
                    return;
                } else {
                    zzkuVarZzl4.zzs.zzd().zzo.zzb(string);
                    str5 = str4;
                }
            }
            ArrayList arrayList2 = new ArrayList();
            arrayList2.add(bundleZzF);
            if (this.zzs.zzd().zzj.zza() > 0 && this.zzs.zzd().zzl(j) && this.zzs.zzd().zzl.zza()) {
                this.zzs.zzau().zzk().zza("Current session is expired, remove the session number, ID, and engagement time");
                bundle2 = bundleZzF;
                arrayList = arrayList2;
                zzB(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_sid", null, this.zzs.zzay().currentTimeMillis());
                zzB(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_sno", null, this.zzs.zzay().currentTimeMillis());
                zzB(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, "_se", null, this.zzs.zzay().currentTimeMillis());
            } else {
                bundle2 = bundleZzF;
                arrayList = arrayList2;
            }
            if (bundle2.getLong(FirebaseAnalytics.Param.EXTEND_SESSION, 0L) == 1) {
                this.zzs.zzau().zzk().zza("EXTEND_SESSION param attached: initiate a new session or extend the current active session");
                this.zzs.zzh().zza.zzb(j, true);
            }
            ArrayList arrayList3 = new ArrayList(bundle2.keySet());
            Collections.sort(arrayList3);
            int size = arrayList3.size();
            for (int i2 = 0; i2 < size; i2++) {
                String str7 = (String) arrayList3.get(i2);
                if (str7 != null) {
                    this.zzs.zzl();
                    Object obj = bundle2.get(str7);
                    if (obj instanceof Bundle) {
                        bundleArr = new Bundle[]{(Bundle) obj};
                    } else if (obj instanceof Parcelable[]) {
                        Parcelable[] parcelableArr = (Parcelable[]) obj;
                        bundleArr = (Bundle[]) Arrays.copyOf(parcelableArr, parcelableArr.length, Bundle[].class);
                    } else if (obj instanceof ArrayList) {
                        ArrayList arrayList4 = (ArrayList) obj;
                        bundleArr = (Bundle[]) arrayList4.toArray(new Bundle[arrayList4.size()]);
                    } else {
                        bundleArr = null;
                    }
                    if (bundleArr != null) {
                        bundle2.putParcelableArray(str7, bundleArr);
                    }
                }
            }
            int i3 = 0;
            while (i3 < arrayList.size()) {
                ArrayList arrayList5 = arrayList;
                Bundle bundle3 = (Bundle) arrayList5.get(i3);
                String str8 = i3 != 0 ? "_ep" : str2;
                bundle3.putString(str6, str);
                Bundle bundleZzU = z2 ? this.zzs.zzl().zzU(bundle3) : bundle3;
                String str9 = str6;
                this.zzs.zzy().zzl(new zzas(str8, new zzaq(bundleZzU), str, j), str3);
                if (!z4) {
                    Iterator<zzgv> it = this.zze.iterator();
                    while (it.hasNext()) {
                        it.next().onEvent(str, str2, new Bundle(bundleZzU), j);
                    }
                }
                i3++;
                str6 = str9;
                arrayList = arrayList5;
            }
            this.zzs.zzat();
            if (this.zzs.zzx().zzh(false) == null || !str5.equals(str2)) {
                return;
            }
            this.zzs.zzh().zzb.zzd(true, true, this.zzs.zzay().elapsedRealtime());
        }
    }

    public final void zzv(String str, String str2, Bundle bundle, boolean z, boolean z2, long j) {
        String str3 = str == null ? "app" : str;
        Bundle bundle2 = bundle == null ? new Bundle() : bundle;
        if (this.zzs.zzc().zzn(null, zzea.zzar) && zzku.zzS(str2, FirebaseAnalytics.Event.SCREEN_VIEW)) {
            this.zzs.zzx().zzj(bundle2, j);
        } else {
            boolean z3 = !z2 || this.zzd == null || zzku.zzR(str2);
            zzx(str3, str2, j, bundle2, z2, z3, !z, null);
        }
    }

    protected final void zzx(String str, String str2, long j, Bundle bundle, boolean z, boolean z2, boolean z3, String str3) {
        Bundle bundle2 = new Bundle(bundle);
        for (String str4 : bundle2.keySet()) {
            Object obj = bundle2.get(str4);
            if (obj instanceof Bundle) {
                bundle2.putBundle(str4, new Bundle((Bundle) obj));
            } else {
                int i = 0;
                if (obj instanceof Parcelable[]) {
                    Parcelable[] parcelableArr = (Parcelable[]) obj;
                    while (i < parcelableArr.length) {
                        Parcelable parcelable = parcelableArr[i];
                        if (parcelable instanceof Bundle) {
                            parcelableArr[i] = new Bundle((Bundle) parcelable);
                        }
                        i++;
                    }
                } else if (obj instanceof List) {
                    List list = (List) obj;
                    while (i < list.size()) {
                        Object obj2 = list.get(i);
                        if (obj2 instanceof Bundle) {
                            list.set(i, new Bundle((Bundle) obj2));
                        }
                        i++;
                    }
                }
            }
        }
        this.zzs.zzav().zzh(new zzhc(this, str, str2, j, bundle2, z, z2, z3, str3));
    }

    public final void zzy(String str, String str2, Object obj, boolean z) {
        zzz(DebugKt.DEBUG_PROPERTY_VALUE_AUTO, str2, obj, true, this.zzs.zzay().currentTimeMillis());
    }

    /* JADX WARN: Removed duplicated region for block: B:11:0x002e  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final void zzz(java.lang.String r20, java.lang.String r21, java.lang.Object r22, boolean r23, long r24) {
        /*
            Method dump skipped, instruction units count: 239
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzhw.zzz(java.lang.String, java.lang.String, java.lang.Object, boolean, long):void");
    }
}
