package com.google.android.gms.measurement.internal;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.os.Bundle;
import android.text.TextUtils;
import com.google.android.gms.common.internal.Preconditions;
import com.google.android.gms.common.util.ProcessUtils;
import com.google.android.gms.common.wrappers.Wrappers;
import com.google.android.gms.internal.measurement.zzpe;
import com.google.firebase.messaging.ServiceStarter;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.List;
import org.checkerframework.checker.nullness.qual.EnsuresNonNull;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
public final class zzae extends zzgn {
    private Boolean zza;
    private zzad zzb;
    private Boolean zzc;

    zzae(zzfu zzfuVar) {
        super(zzfuVar);
        this.zzb = zzac.zza;
    }

    public static final long zzA() {
        return zzea.zzC.zzb(null).longValue();
    }

    private final String zzB(String str, String str2) {
        try {
            String str3 = (String) Class.forName("android.os.SystemProperties").getMethod("get", String.class, String.class).invoke(null, str, "");
            Preconditions.checkNotNull(str3);
            return str3;
        } catch (ClassNotFoundException e) {
            this.zzs.zzau().zzb().zzb("Could not find SystemProperties class", e);
            return "";
        } catch (IllegalAccessException e2) {
            this.zzs.zzau().zzb().zzb("Could not access SystemProperties.get()", e2);
            return "";
        } catch (NoSuchMethodException e3) {
            this.zzs.zzau().zzb().zzb("Could not find SystemProperties.get() method", e3);
            return "";
        } catch (InvocationTargetException e4) {
            this.zzs.zzau().zzb().zzb("SystemProperties.get() threw an exception", e4);
            return "";
        }
    }

    public static final long zzz() {
        return zzea.zzc.zzb(null).longValue();
    }

    final void zza(zzad zzadVar) {
        this.zzb = zzadVar;
    }

    final String zzb() {
        this.zzs.zzat();
        return "FA";
    }

    public final int zzc() {
        zzku zzkuVarZzl = this.zzs.zzl();
        Boolean boolZzC = zzkuVarZzl.zzs.zzy().zzC();
        if (zzkuVarZzl.zzZ() < 201500) {
            return (boolZzC == null || boolZzC.booleanValue()) ? 25 : 100;
        }
        return 100;
    }

    public final int zzd(String str) {
        return zzl(str, zzea.zzH, 25, 100);
    }

    final int zze(String str) {
        return zzl(str, zzea.zzG, ServiceStarter.ERROR_UNKNOWN, 2000);
    }

    public final long zzf() {
        this.zzs.zzat();
        return 42004L;
    }

    @EnsuresNonNull({"this.isMainProcess"})
    public final boolean zzh() {
        if (this.zzc == null) {
            synchronized (this) {
                if (this.zzc == null) {
                    ApplicationInfo applicationInfo = this.zzs.zzax().getApplicationInfo();
                    String myProcessName = ProcessUtils.getMyProcessName();
                    if (applicationInfo != null) {
                        String str = applicationInfo.processName;
                        boolean z = false;
                        if (str != null && str.equals(myProcessName)) {
                            z = true;
                        }
                        this.zzc = Boolean.valueOf(z);
                    }
                    if (this.zzc == null) {
                        this.zzc = Boolean.TRUE;
                        this.zzs.zzau().zzb().zza("My process not in the list of running processes");
                    }
                }
            }
        }
        return this.zzc.booleanValue();
    }

    public final String zzi(String str, zzdz<String> zzdzVar) {
        return str == null ? zzdzVar.zzb(null) : zzdzVar.zzb(this.zzb.zza(str, zzdzVar.zza()));
    }

    public final long zzj(String str, zzdz<Long> zzdzVar) {
        if (str == null) {
            return zzdzVar.zzb(null).longValue();
        }
        String strZza = this.zzb.zza(str, zzdzVar.zza());
        if (TextUtils.isEmpty(strZza)) {
            return zzdzVar.zzb(null).longValue();
        }
        try {
            return zzdzVar.zzb(Long.valueOf(Long.parseLong(strZza))).longValue();
        } catch (NumberFormatException e) {
            return zzdzVar.zzb(null).longValue();
        }
    }

    public final int zzk(String str, zzdz<Integer> zzdzVar) {
        if (str == null) {
            return zzdzVar.zzb(null).intValue();
        }
        String strZza = this.zzb.zza(str, zzdzVar.zza());
        if (TextUtils.isEmpty(strZza)) {
            return zzdzVar.zzb(null).intValue();
        }
        try {
            return zzdzVar.zzb(Integer.valueOf(Integer.parseInt(strZza))).intValue();
        } catch (NumberFormatException e) {
            return zzdzVar.zzb(null).intValue();
        }
    }

    public final int zzl(String str, zzdz<Integer> zzdzVar, int i, int i2) {
        return Math.max(Math.min(zzk(str, zzdzVar), i2), i);
    }

    public final double zzm(String str, zzdz<Double> zzdzVar) {
        if (str == null) {
            return zzdzVar.zzb(null).doubleValue();
        }
        String strZza = this.zzb.zza(str, zzdzVar.zza());
        if (TextUtils.isEmpty(strZza)) {
            return zzdzVar.zzb(null).doubleValue();
        }
        try {
            return zzdzVar.zzb(Double.valueOf(Double.parseDouble(strZza))).doubleValue();
        } catch (NumberFormatException e) {
            return zzdzVar.zzb(null).doubleValue();
        }
    }

    public final boolean zzn(String str, zzdz<Boolean> zzdzVar) {
        if (str == null) {
            return zzdzVar.zzb(null).booleanValue();
        }
        String strZza = this.zzb.zza(str, zzdzVar.zza());
        return TextUtils.isEmpty(strZza) ? zzdzVar.zzb(null).booleanValue() : zzdzVar.zzb(Boolean.valueOf(Boolean.parseBoolean(strZza))).booleanValue();
    }

    final Bundle zzo() {
        try {
            if (this.zzs.zzax().getPackageManager() == null) {
                this.zzs.zzau().zzb().zza("Failed to load metadata: PackageManager is null");
                return null;
            }
            ApplicationInfo applicationInfo = Wrappers.packageManager(this.zzs.zzax()).getApplicationInfo(this.zzs.zzax().getPackageName(), 128);
            if (applicationInfo != null) {
                return applicationInfo.metaData;
            }
            this.zzs.zzau().zzb().zza("Failed to load metadata: ApplicationInfo is null");
            return null;
        } catch (PackageManager.NameNotFoundException e) {
            this.zzs.zzau().zzb().zzb("Failed to load metadata: Package name not found", e);
            return null;
        }
    }

    final Boolean zzp(String str) {
        Preconditions.checkNotEmpty(str);
        Bundle bundleZzo = zzo();
        if (bundleZzo == null) {
            this.zzs.zzau().zzb().zza("Failed to load metadata: Metadata bundle is null");
            return null;
        }
        if (bundleZzo.containsKey(str)) {
            return Boolean.valueOf(bundleZzo.getBoolean(str));
        }
        return null;
    }

    final List<String> zzq(String str) {
        Integer numValueOf;
        Preconditions.checkNotEmpty("analytics.safelisted_events");
        Bundle bundleZzo = zzo();
        if (bundleZzo == null) {
            this.zzs.zzau().zzb().zza("Failed to load metadata: Metadata bundle is null");
            numValueOf = null;
        } else {
            numValueOf = !bundleZzo.containsKey("analytics.safelisted_events") ? null : Integer.valueOf(bundleZzo.getInt("analytics.safelisted_events"));
        }
        if (numValueOf == null) {
            return null;
        }
        try {
            String[] stringArray = this.zzs.zzax().getResources().getStringArray(numValueOf.intValue());
            if (stringArray == null) {
                return null;
            }
            return Arrays.asList(stringArray);
        } catch (Resources.NotFoundException e) {
            this.zzs.zzau().zzb().zzb("Failed to load string array from metadata: resource not found", e);
            return null;
        }
    }

    public final boolean zzr() {
        this.zzs.zzat();
        Boolean boolZzp = zzp("firebase_analytics_collection_deactivated");
        return boolZzp != null && boolZzp.booleanValue();
    }

    public final boolean zzs() {
        Boolean boolZzp = zzp("google_analytics_adid_collection_enabled");
        return boolZzp == null || boolZzp.booleanValue();
    }

    public final boolean zzt() {
        Boolean boolZzp;
        zzpe.zzb();
        return !zzn(null, zzea.zzaq) || (boolZzp = zzp("google_analytics_automatic_screen_reporting_enabled")) == null || boolZzp.booleanValue();
    }

    public final String zzu() {
        return zzB("debug.firebase.analytics.app", "");
    }

    public final String zzv() {
        return zzB("debug.deferred.deeplink", "");
    }

    public final boolean zzw(String str) {
        return "1".equals(this.zzb.zza(str, "gaia_collection_enabled"));
    }

    public final boolean zzx(String str) {
        return "1".equals(this.zzb.zza(str, "measurement.event_sampling_enabled"));
    }

    final boolean zzy() {
        if (this.zza == null) {
            Boolean boolZzp = zzp("app_measurement_lite");
            this.zza = boolZzp;
            if (boolZzp == null) {
                this.zza = false;
            }
        }
        return this.zza.booleanValue() || !this.zzs.zzu();
    }
}
