package com.google.android.gms.measurement.internal;

import android.content.SharedPreferences;
import android.util.Pair;
import com.google.android.gms.ads.identifier.AdvertisingIdClient;
import com.google.android.gms.common.internal.Preconditions;
import org.checkerframework.checker.nullness.qual.EnsuresNonNull;

/* JADX INFO: compiled from: com.google.android.gms:play-services-measurement-impl@@19.0.0 */
/* JADX INFO: loaded from: classes.dex */
final class zzfb extends zzgo {
    static final Pair<String, Long> zza = new Pair<>("", 0L);
    public zzez zzb;
    public final zzey zzc;
    public final zzey zzd;
    public final zzfa zze;
    public final zzey zzf;
    public final zzew zzg;
    public final zzfa zzh;
    public final zzew zzi;
    public final zzey zzj;
    public boolean zzk;
    public final zzew zzl;
    public final zzew zzm;
    public final zzey zzn;
    public final zzfa zzo;
    public final zzfa zzp;
    public final zzey zzq;
    public final zzex zzr;
    private SharedPreferences zzt;
    private String zzu;
    private boolean zzv;
    private long zzw;

    zzfb(zzfu zzfuVar) {
        super(zzfuVar);
        this.zzf = new zzey(this, "session_timeout", 1800000L);
        this.zzg = new zzew(this, "start_new_session", true);
        this.zzj = new zzey(this, "last_pause_time", 0L);
        this.zzh = new zzfa(this, "non_personalized_ads", null);
        this.zzi = new zzew(this, "allow_remote_dynamite", false);
        this.zzc = new zzey(this, "first_open_time", 0L);
        this.zzd = new zzey(this, "app_install_time", 0L);
        this.zze = new zzfa(this, "app_instance_id", null);
        this.zzl = new zzew(this, "app_backgrounded", false);
        this.zzm = new zzew(this, "deep_link_retrieval_complete", false);
        this.zzn = new zzey(this, "deep_link_retrieval_attempts", 0L);
        this.zzo = new zzfa(this, "firebase_feature_rollouts", null);
        this.zzp = new zzfa(this, "deferred_attribution_cache", null);
        this.zzq = new zzey(this, "deferred_attribution_cache_timestamp", 0L);
        this.zzr = new zzex(this, "default_event_parameters", null);
    }

    @Override // com.google.android.gms.measurement.internal.zzgo
    protected final boolean zza() {
        return true;
    }

    @Override // com.google.android.gms.measurement.internal.zzgo
    @EnsuresNonNull.List({@EnsuresNonNull({"this.preferences"}), @EnsuresNonNull({"this.monitoringSample"})})
    protected final void zzaz() {
        SharedPreferences sharedPreferences = this.zzs.zzax().getSharedPreferences("com.google.android.gms.measurement.prefs", 0);
        this.zzt = sharedPreferences;
        boolean z = sharedPreferences.getBoolean("has_been_opened", false);
        this.zzk = z;
        if (!z) {
            SharedPreferences.Editor editorEdit = this.zzt.edit();
            editorEdit.putBoolean("has_been_opened", true);
            editorEdit.apply();
        }
        this.zzs.zzc();
        this.zzb = new zzez(this, "health_monitor", Math.max(0L, zzea.zzb.zzb(null).longValue()), null);
    }

    final Pair<String, Boolean> zzb(String str) {
        zzg();
        long jElapsedRealtime = this.zzs.zzay().elapsedRealtime();
        String str2 = this.zzu;
        if (str2 != null && jElapsedRealtime < this.zzw) {
            return new Pair<>(str2, Boolean.valueOf(this.zzv));
        }
        this.zzw = jElapsedRealtime + this.zzs.zzc().zzj(str, zzea.zza);
        AdvertisingIdClient.setShouldSkipGmsCoreVersionCheck(true);
        try {
            AdvertisingIdClient.Info advertisingIdInfo = AdvertisingIdClient.getAdvertisingIdInfo(this.zzs.zzax());
            this.zzu = "";
            String id = advertisingIdInfo.getId();
            if (id != null) {
                this.zzu = id;
            }
            this.zzv = advertisingIdInfo.isLimitAdTrackingEnabled();
        } catch (Exception e) {
            this.zzs.zzau().zzj().zzb("Unable to get advertising id", e);
            this.zzu = "";
        }
        AdvertisingIdClient.setShouldSkipGmsCoreVersionCheck(false);
        return new Pair<>(this.zzu, Boolean.valueOf(this.zzv));
    }

    protected final SharedPreferences zzd() {
        zzg();
        zzv();
        Preconditions.checkNotNull(this.zzt);
        return this.zzt;
    }

    final void zze(Boolean bool) {
        zzg();
        SharedPreferences.Editor editorEdit = zzd().edit();
        if (bool != null) {
            editorEdit.putBoolean("measurement_enabled", bool.booleanValue());
        } else {
            editorEdit.remove("measurement_enabled");
        }
        editorEdit.apply();
    }

    final Boolean zzf() {
        zzg();
        if (zzd().contains("measurement_enabled")) {
            return Boolean.valueOf(zzd().getBoolean("measurement_enabled", true));
        }
        return null;
    }

    final boolean zzh(int i) {
        return zzaf.zzm(i, zzd().getInt("consent_source", 100));
    }

    final zzaf zzi() {
        zzg();
        return zzaf.zzc(zzd().getString("consent_settings", "G1"));
    }

    final void zzj(boolean z) {
        zzg();
        this.zzs.zzau().zzk().zzb("App measurement setting deferred collection", Boolean.valueOf(z));
        SharedPreferences.Editor editorEdit = zzd().edit();
        editorEdit.putBoolean("deferred_analytics_collection", z);
        editorEdit.apply();
    }

    final boolean zzk() {
        SharedPreferences sharedPreferences = this.zzt;
        if (sharedPreferences == null) {
            return false;
        }
        return sharedPreferences.contains("deferred_analytics_collection");
    }

    final boolean zzl(long j) {
        return j - this.zzf.zza() > this.zzj.zza();
    }
}
