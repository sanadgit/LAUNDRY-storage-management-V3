package com.google.android.gms.measurement.internal;

import android.app.Activity;
import android.os.Bundle;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.measurement.api.AppMeasurementSdk;
import com.google.firebase.analytics.FirebaseAnalytics;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzik extends zzf {
    protected zzid zza;
    private volatile zzid zzb;
    private zzid zzc;
    private final Map<Activity, zzid> zzd;
    private Activity zze;
    private volatile boolean zzf;
    private volatile zzid zzg;
    private zzid zzh;
    private boolean zzi;
    private final Object zzj;
    private zzid zzk;
    private String zzl;

    public zzik(zzfu zzfuVar) {
        super(zzfuVar);
        this.zzj = new Object();
        this.zzd = new ConcurrentHashMap();
    }

    /* JADX INFO: Access modifiers changed from: private */
    /* JADX WARN: Removed duplicated region for block: B:55:0x00e7  */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final void zzB(com.google.android.gms.measurement.internal.zzid r10, com.google.android.gms.measurement.internal.zzid r11, long r12, boolean r14, android.os.Bundle r15) {
        /*
            Method dump skipped, instruction units count: 303
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzik.zzB(com.google.android.gms.measurement.internal.zzid, com.google.android.gms.measurement.internal.zzid, long, boolean, android.os.Bundle):void");
    }

    /* JADX INFO: Access modifiers changed from: private */
    public final void zzC(zzid zzidVar, boolean z, long j) {
        this.zzs.zzB().zzc(this.zzs.zzay().elapsedRealtime());
        if (!this.zzs.zzh().zzb.zzd(zzidVar != null && zzidVar.zzd, z, j) || zzidVar == null) {
            return;
        }
        zzidVar.zzd = false;
    }

    private final zzid zzD(Activity activity) {
        Preconditions.checkNotNull(activity);
        zzid zzidVar = this.zzd.get(activity);
        if (zzidVar == null) {
            zzid zzidVar2 = new zzid(null, zzi(activity.getClass(), "Activity"), this.zzs.zzl().zzd());
            this.zzd.put(activity, zzidVar2);
            zzidVar = zzidVar2;
        }
        return (this.zzs.zzc().zzn(null, zzea.zzar) && this.zzg != null) ? this.zzg : zzidVar;
    }

    public static void zzm(zzid zzidVar, Bundle bundle, boolean z) {
        if (zzidVar != null) {
            if (!bundle.containsKey("_sc") || z) {
                String str = zzidVar.zza;
                if (str != null) {
                    bundle.putString("_sn", str);
                } else {
                    bundle.remove("_sn");
                }
                String str2 = zzidVar.zzb;
                if (str2 != null) {
                    bundle.putString("_sc", str2);
                } else {
                    bundle.remove("_sc");
                }
                bundle.putLong("_si", zzidVar.zzc);
                return;
            }
            z = false;
        }
        if (zzidVar == null && z) {
            bundle.remove("_sn");
            bundle.remove("_sc");
            bundle.remove("_si");
        }
    }

    static /* synthetic */ void zzu(zzik zzikVar, Bundle bundle, zzid zzidVar, zzid zzidVar2, long j) {
        bundle.remove(FirebaseAnalytics.Param.SCREEN_NAME);
        bundle.remove(FirebaseAnalytics.Param.SCREEN_CLASS);
        zzikVar.zzB(zzidVar, zzidVar2, j, true, zzikVar.zzs.zzl().zzF(null, FirebaseAnalytics.Event.SCREEN_VIEW, bundle, null, true));
    }

    static /* synthetic */ zzid zzz(zzik zzikVar, zzid zzidVar) {
        zzikVar.zzh = null;
        return null;
    }

    @Override // com.google.android.gms.measurement.internal.zzf
    protected final boolean zze() {
        return false;
    }

    public final zzid zzh(boolean z) {
        zzb();
        zzg();
        if (!this.zzs.zzc().zzn(null, zzea.zzar) || !z) {
            return this.zza;
        }
        zzid zzidVar = this.zza;
        return zzidVar != null ? zzidVar : this.zzh;
    }

    final String zzi(Class<?> cls, String str) {
        String canonicalName = cls.getCanonicalName();
        if (canonicalName == null) {
            return "Activity";
        }
        String[] strArrSplit = canonicalName.split("\\.");
        int length = strArrSplit.length;
        String str2 = length > 0 ? strArrSplit[length - 1] : "";
        int length2 = str2.length();
        this.zzs.zzc();
        if (length2 <= 100) {
            return str2;
        }
        this.zzs.zzc();
        return str2.substring(0, 100);
    }

    /* JADX WARN: Code restructure failed: missing block: B:18:0x0050, code lost:
    
        if (r2 > 100) goto L19;
     */
    /* JADX WARN: Code restructure failed: missing block: B:27:0x0082, code lost:
    
        if (r4 > 100) goto L28;
     */
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final void zzj(android.os.Bundle r13, long r14) {
        /*
            Method dump skipped, instruction units count: 318
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzik.zzj(android.os.Bundle, long):void");
    }

    /* JADX WARN: Code restructure failed: missing block: B:27:0x0088, code lost:
    
        if (r1 <= 100) goto L31;
     */
    /* JADX WARN: Code restructure failed: missing block: B:35:0x00b4, code lost:
    
        if (r1 <= 100) goto L39;
     */
    @java.lang.Deprecated
    /*
        Code decompiled incorrectly, please refer to instructions dump.
        To view partially-correct code enable 'Show inconsistent code' option in preferences
    */
    public final void zzk(android.app.Activity r4, java.lang.String r5, java.lang.String r6) {
        /*
            Method dump skipped, instruction units count: 254
            To view this dump change 'Code comments level' option to 'DEBUG'
        */
        throw new UnsupportedOperationException("Method not decompiled: com.google.android.gms.measurement.internal.zzik.zzk(android.app.Activity, java.lang.String, java.lang.String):void");
    }

    public final zzid zzl() {
        return this.zzb;
    }

    public final void zzn(String str, zzid zzidVar) {
        zzg();
        synchronized (this) {
            String str2 = this.zzl;
            if (str2 == null || str2.equals(str) || zzidVar != null) {
                this.zzl = str;
                this.zzk = zzidVar;
            }
        }
    }

    public final void zzo(Activity activity, Bundle bundle) {
        Bundle bundle2;
        if (!this.zzs.zzc().zzt() || bundle == null || (bundle2 = bundle.getBundle("com.google.app_measurement.screen_service")) == null) {
            return;
        }
        this.zzd.put(activity, new zzid(bundle2.getString(AppMeasurementSdk.ConditionalUserProperty.NAME), bundle2.getString("referrer_name"), bundle2.getLong("id")));
    }

    public final void zzq(Activity activity) {
        if (this.zzs.zzc().zzn(null, zzea.zzar)) {
            synchronized (this.zzj) {
                this.zzi = true;
                if (activity != this.zze) {
                    synchronized (this.zzj) {
                        this.zze = activity;
                        this.zzf = false;
                    }
                    if (this.zzs.zzc().zzn(null, zzea.zzaq) && this.zzs.zzc().zzt()) {
                        this.zzg = null;
                        this.zzs.zzav().zzh(new zzij(this));
                    }
                }
            }
        }
        if (this.zzs.zzc().zzn(null, zzea.zzaq) && !this.zzs.zzc().zzt()) {
            this.zzb = this.zzg;
            this.zzs.zzav().zzh(new zzig(this));
        } else {
            zzA(activity, zzD(activity), false);
            zzd zzdVarZzB = this.zzs.zzB();
            zzdVarZzB.zzs.zzav().zzh(new zzc(zzdVarZzB, zzdVarZzB.zzs.zzay().elapsedRealtime()));
        }
    }

    public final void zzr(Activity activity) {
        if (this.zzs.zzc().zzn(null, zzea.zzar)) {
            synchronized (this.zzj) {
                this.zzi = false;
                this.zzf = true;
            }
        }
        long jElapsedRealtime = this.zzs.zzay().elapsedRealtime();
        if (this.zzs.zzc().zzn(null, zzea.zzaq) && !this.zzs.zzc().zzt()) {
            this.zzb = null;
            this.zzs.zzav().zzh(new zzih(this, jElapsedRealtime));
        } else {
            zzid zzidVarZzD = zzD(activity);
            this.zzc = this.zzb;
            this.zzb = null;
            this.zzs.zzav().zzh(new zzii(this, zzidVarZzD, jElapsedRealtime));
        }
    }

    public final void zzs(Activity activity, Bundle bundle) {
        zzid zzidVar;
        if (!this.zzs.zzc().zzt() || bundle == null || (zzidVar = this.zzd.get(activity)) == null) {
            return;
        }
        Bundle bundle2 = new Bundle();
        bundle2.putLong("id", zzidVar.zzc);
        bundle2.putString(AppMeasurementSdk.ConditionalUserProperty.NAME, zzidVar.zza);
        bundle2.putString("referrer_name", zzidVar.zzb);
        bundle.putBundle("com.google.app_measurement.screen_service", bundle2);
    }

    public final void zzt(Activity activity) {
        synchronized (this.zzj) {
            if (activity == this.zze) {
                this.zze = null;
            }
        }
        if (this.zzs.zzc().zzt()) {
            this.zzd.remove(activity);
        }
    }

    private final void zzA(Activity activity, zzid zzidVar, boolean z) {
        zzid zzidVar2;
        zzid zzidVar3 = this.zzb == null ? this.zzc : this.zzb;
        if (zzidVar.zzb == null) {
            zzidVar2 = new zzid(zzidVar.zza, activity != null ? zzi(activity.getClass(), "Activity") : null, zzidVar.zzc, zzidVar.zze, zzidVar.zzf);
        } else {
            zzidVar2 = zzidVar;
        }
        this.zzc = this.zzb;
        this.zzb = zzidVar2;
        this.zzs.zzav().zzh(new zzif(this, zzidVar2, zzidVar3, this.zzs.zzay().elapsedRealtime(), z));
    }
}
